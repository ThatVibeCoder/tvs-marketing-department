"""Fixes from the code review of PR #18 (handoffs/TVS-CODE-REVIEW-2026-11-07.md), one class per item.
Run: python3 -m unittest discover tests

Each class failed before its fix. They run on throwaway copies of the files, never the repo itself.
"""
import datetime
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

DAY = datetime.date(2026, 11, 7)


class ServerCase(unittest.TestCase):
    """A throwaway copy of the repo with the Content Team added and tools/serve.py running on it."""

    def setUp(self):
        import shutil, subprocess, tempfile, time, socket
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from fixtures import add_content_team
        add_content_team(self.repo)  # posts need a Content Team; its lesson builds it, so write a stand-in
        s = socket.socket(); s.bind(("127.0.0.1", 0)); self.port = s.getsockname()[1]; s.close()
        self.proc = subprocess.Popen([sys.executable, "tools/serve.py", "--port", str(self.port)], cwd=self.repo,
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                self.call("GET", "/api/health")
                break
            except OSError:
                time.sleep(0.1)

    def tearDown(self):
        import shutil
        self.proc.terminate()
        self.proc.wait(5)
        shutil.rmtree(self.tmp, ignore_errors=True)

    def call(self, method, path, body=None):
        import http.client, json
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        headers = {"Host": "localhost"}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers.update({"Content-Type": "application/json", "Origin": f"http://localhost:{self.port}"})
        c.request(method, path, body=data, headers=headers)
        r = c.getresponse()
        raw = r.read()
        return r.status, (json.loads(raw) if raw[:1] in (b"{", b"[") else raw)

    def text(self, rel):
        with open(os.path.join(self.repo, rel), encoding="utf-8") as f:
            return f.read()



class F3StaleSaves(ServerCase):
    """A save from a page opened before someone else edited the file used to wipe their edit. Now it's a 409."""

    def test_post_save_after_an_outside_edit_is_refused(self):
        code, res = self.call("POST", "/api/posts", {"platform": "threads", "body": "First words."})
        pid = res["id"]
        post = [p for p in res["state"]["content"]["posts"] if p["id"] == pid][0]
        self.assertTrue(post.get("hash"))
        rel = post["path"]
        t = self.text(rel).replace("First words.", "The AI's better words.")
        with open(os.path.join(self.repo, rel), "w", encoding="utf-8") as f:
            f.write(t)
        code, res = self.call("POST", "/api/posts/" + pid, {"body": "My stale words.", "hash": post["hash"]})
        self.assertEqual(code, 409, res)
        self.assertIn("The AI's better words.", self.text(rel))

    def test_the_page_sends_the_hash(self):
        with open(os.path.join(ROOT, "dashboard", "assets", "editor.js"), encoding="utf-8") as f:
            self.assertIn("hash:", f.read())


class F8Symlinks(ServerCase):
    """The repo couldn't be served from a symlinked folder, and saves followed symlinks out of the repo."""

    def test_writes_never_follow_a_symlink(self):
        outside = os.path.join(self.tmp, "outside.md")
        with open(outside, "w", encoding="utf-8") as f:
            f.write("# outside\n")
        # a post file that's a link
        code, res = self.call("POST", "/api/posts", {"platform": "threads", "body": "Real."})
        pid = res["id"]; rel = [p for p in res["state"]["content"]["posts"] if p["id"] == pid][0]["path"]
        target = os.path.join(self.repo, rel)
        os.remove(target); os.symlink(outside, target)
        code, res = self.call("POST", "/api/posts/" + pid, {"body": "Overwrite?"})
        self.assertEqual(code, 400, res)
        with open(outside, encoding="utf-8") as f:
            self.assertEqual(f.read(), "# outside\n")
        # .env that's a link
        envout = os.path.join(self.tmp, "elsewhere.env")
        open(envout, "w").close()
        os.symlink(envout, os.path.join(self.repo, ".env"))
        code, res = self.call("POST", "/api/keys", {"name": "BLOTATO_API_KEY", "value": "abc12345"})
        self.assertEqual(code, 400, res)
        self.assertEqual(os.path.getsize(envout), 0)

    def test_served_from_a_symlinked_folder(self):
        import subprocess, socket, time
        link = os.path.join(self.tmp, "via-link")
        os.symlink(self.repo, link)
        s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
        proc = subprocess.Popen([sys.executable, os.path.join(link, "tools", "serve.py"), "--port", str(port)], cwd=link,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            import http.client
            for _ in range(50):
                try:
                    c = http.client.HTTPConnection("127.0.0.1", port, timeout=5); c.request("GET", "/", headers={"Host": "localhost"}); r = c.getresponse(); r.read()
                    break
                except OSError:
                    time.sleep(0.1)
            self.assertEqual(r.status, 200)
        finally:
            proc.terminate(); proc.wait(5)


class F9OriginAndType(ServerCase):
    """A page on another localhost port (a dev server) could write keys with a 'simple' Content-Type."""

    def post(self, origin, ctype, body):
        import http.client, json
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        h = {"Host": f"localhost:{self.port}", "Content-Type": ctype}
        if origin:
            h["Origin"] = origin
        c.request("POST", "/api/keys", body=json.dumps(body).encode(), headers=h)
        r = c.getresponse(); r.read()
        return r.status

    def test_another_localhost_port_is_refused(self):
        self.assertEqual(self.post("http://localhost:3000", "application/json", {"name": "BLOTATO_API_KEY", "value": "attacker1"}), 403)
        self.assertEqual(self.post("http://127.0.0.1:5173", "application/json", {"name": "BLOTATO_API_KEY", "value": "attacker1"}), 403)
        self.assertFalse(os.path.exists(os.path.join(self.repo, ".env")))

    def test_a_smuggled_content_type_is_refused(self):
        self.assertEqual(self.post(f"http://localhost:{self.port}", "text/plain; x=application/json", {"name": "BLOTATO_API_KEY", "value": "attacker1"}), 415)

    def test_this_page_still_saves(self):
        self.assertEqual(self.post(f"http://localhost:{self.port}", "application/json; charset=utf-8", {"name": "BLOTATO_API_KEY", "value": "mine1234"}), 200)
        self.assertEqual(self.post(f"http://127.0.0.1:{self.port}", "application/json", {"name": "BLOTATO_API_KEY", "value": ""}), 200)


class F10AtomicWrites(unittest.TestCase):
    """.env was written in place (a crash left half a file) and readable by everyone on the computer."""

    def setUp(self):
        import tempfile
        import serve
        self.serve = serve
        self.tmp = os.path.realpath(tempfile.mkdtemp())
        self._old = (serve.ENV_FILE, serve.files.ROOT)
        serve.ENV_FILE = os.path.join(self.tmp, ".env")
        serve.files.ROOT = self.tmp

    def tearDown(self):
        import shutil
        self.serve.ENV_FILE, self.serve.files.ROOT = self._old
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_env_is_private(self):
        import stat
        self.serve.write_key("BLOTATO_API_KEY", "abc12345")
        self.assertEqual(stat.S_IMODE(os.stat(self.serve.ENV_FILE).st_mode), 0o600)

    def test_a_failed_write_leaves_the_old_file_whole(self):
        from unittest import mock
        self.serve.write_key("BLOTATO_API_KEY", "first123")
        with mock.patch("os.replace", side_effect=OSError("disk full")):
            with self.assertRaises(OSError):
                self.serve.write_key("AYRSHARE_API_KEY", "second12")
        with open(self.serve.ENV_FILE, encoding="utf-8") as f:
            self.assertEqual(f.read(), "BLOTATO_API_KEY=first123\n")
        self.assertEqual(sorted(os.listdir(self.tmp)), [".env"])          # no half-written temp file left behind

    def test_every_server_write_is_atomic(self):
        for rel in ("tools/serve.py", "tools/files.py", "tools/pull_web.py"):
            with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
                plain = [ln.strip() for ln in f if "open(" in ln and '"w"' in ln]
            self.assertEqual(plain, [], f"{rel} still writes a file in place")

class F7BadInputIsAPlainError(ServerCase):
    """Odd input dropped the connection ('couldn't reach the server') instead of saying what was wrong."""

    def raw(self, path, body, length=None):
        import http.client, json
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        c.putrequest("POST", path)
        c.putheader("Host", "localhost"); c.putheader("Content-Type", "application/json")
        c.putheader("Content-Length", str(len(data) if length is None else length)); c.endheaders()
        c.send(data)
        r = c.getresponse()
        raw = r.read()
        return r.status, json.loads(raw)

    def test_each_shape_gets_a_reason(self):
        cases = [
            ("/api/posts", {"platform": "threads", "body": "x", "date": 20261107}),
            ("/api/posts", ["not", "an", "object"]),
            ("/api/settings", ["not", "an", "object"]),
            ("/api/keys", {"name": ["BLOTATO_API_KEY"], "value": "x"}),
        ]
        for path, body in cases:
            code, res = self.raw(path, body)
            self.assertEqual(code, 400, (path, body, res))
            self.assertTrue(res.get("error"), (path, body))

    def test_negative_and_huge_lengths(self):
        code, res = self.raw("/api/settings", {"poster": "manual"}, length=-1)
        self.assertEqual(code, 400)
        code, res = self.raw("/api/settings", b"{}", length=3_000_000)
        self.assertEqual(code, 413)


class F11KeyLookingValues(unittest.TestCase):
    """settings.json is saved to GitHub, and the guard only looked for key NAMES, not key values."""

    def setUp(self):
        import tempfile
        import serve, sync
        self.serve, self.sync = serve, sync
        self.tmp = os.path.realpath(tempfile.mkdtemp())
        self._old = (sync.SETTINGS_FILE, serve.files.ROOT)
        sync.SETTINGS_FILE = os.path.join(self.tmp, "settings.json")
        serve.files.ROOT = self.tmp

    def tearDown(self):
        import shutil
        self.sync.SETTINGS_FILE, self.serve.files.ROOT = self._old
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_a_pasted_secret_is_refused(self):
        for v in ("rk_live_51Hxyzabcdefghijklmnop", "sk_test_" + "a1" * 12, "-----BEGIN PRIVATE KEY-----", "ghp_" + "A1b2" * 9,
                  "AIza" + "Sy" * 18, "EAAB" + "cd34" * 8, "xoxb-1234-5678-abcdefghij", "sk-ant-api03-" + "x9" * 15):
            with self.assertRaisesRegex(ValueError, "looks like a key", msg=v):
                self.serve.save_settings({"account": {"name": v}})
        self.assertFalse(os.path.exists(self.sync.SETTINGS_FILE))

    def test_ordinary_words_that_name_a_key_are_fine(self):
        self.serve.save_settings({"account": {"name": "Notes about STRIPE_RESTRICTED_KEY setup", "role": "Owner"}})
        self.serve.save_settings({"web": {"siteDomain": "www.my-long-business-name-that-goes-on.example"}})


def _test_rsa_pem():
    """A throwaway 1024-bit RSA key built in the test from a fixed seed (no key is stored in the repo), as PKCS#1 PEM."""
    import base64, random
    rnd = random.Random(20261107)

    def is_prime(n):
        if n < 2 or n % 2 == 0:
            return n == 2
        d, r = n - 1, 0
        while d % 2 == 0:
            d //= 2; r += 1
        for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
            x = pow(a, d, n)
            if x in (1, n - 1):
                continue
            for _ in range(r - 1):
                x = pow(x, 2, n)
                if x == n - 1:
                    break
            else:
                return False
        return True

    def prime(bits):
        while True:
            c = rnd.getrandbits(bits) | (1 << (bits - 1)) | 1
            if is_prime(c):
                return c
    e = 65537
    while True:
        p, q = prime(512), prime(512)
        phi = (p - 1) * (q - 1)
        if p != q and phi % e:
            break
    n, d = p * q, pow(e, -1, phi)

    def der_int(v):
        b = v.to_bytes((v.bit_length() + 8) // 8 or 1, "big")
        return b"\x02" + der_len(len(b)) + b

    def der_len(L):
        if L < 128:
            return bytes([L])
        b = L.to_bytes((L.bit_length() + 7) // 8, "big")
        return bytes([0x80 | len(b)]) + b
    body = b"".join(der_int(v) for v in (0, n, e, d, p, q, d % (p - 1), d % (q - 1), pow(q, -1, p)))
    der = b"\x30" + der_len(len(body)) + body
    pem = "-----BEGIN RSA PRIVATE KEY-----\n" + base64.b64encode(der).decode() + "\n-----END RSA PRIVATE KEY-----\n"
    return pem, n, e


class F13KeyParsing(unittest.TestCase):
    """A truncated or garbled private key crashed the pull instead of saying the key is damaged."""

    def test_a_truncated_key_never_signs(self):
        """Cut short anywhere (and still valid base64), the key used to sign with garbage or crash."""
        import base64, pull_web
        pem, n, e = _test_rsa_pem()
        der = base64.b64decode(pem.split("\n")[1])
        for cut in range(1, len(der), 7):
            broken = "-----BEGIN RSA PRIVATE KEY-----\n" + base64.b64encode(der[:cut]).decode() + "\n-----END RSA PRIVATE KEY-----"
            with self.assertRaises(pull_web.WebPullError, msg=f"cut at {cut}"):
                pull_web.rs256(b"msg", broken)

    def test_a_damaged_key_is_a_plain_error(self):
        import pull_web
        pem, n, e = _test_rsa_pem()
        body = pem.split("\n")[1]
        for broken in (pem.replace(body, body[: len(body) // 3]), pem.replace(body, body[:40]), "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----",
                       pem.replace(body, "MII" + "A" * 60), "not a key at all"):
            with self.assertRaises(pull_web.WebPullError, msg=broken[:60]):
                pull_web.rs256(b"msg", broken)

    def test_rs256_known_answer(self):
        import hashlib, pull_web
        pem, n, e = _test_rsa_pem()
        sig = pull_web.rs256(b"header.claims", pem)
        k = (n.bit_length() + 7) // 8
        em = pow(int.from_bytes(sig, "big"), e, n).to_bytes(k, "big")   # verify: EMSA-PKCS1-v1_5, RFC 8017 9.2
        digest_info = bytes.fromhex("3031300d060960864801650304020105000420") + hashlib.sha256(b"header.claims").digest()
        self.assertEqual(em, b"\x00\x01" + b"\xff" * (k - len(digest_info) - 3) + b"\x00" + digest_info)
        self.assertEqual(hashlib.sha256(sig).hexdigest()[:16], "63664769ca43e724")  # the same key and message always sign the same

    def test_the_spec_is_named(self):
        with open(os.path.join(ROOT, "tools", "pull_web.py"), encoding="utf-8") as f:
            src = f.read()
        self.assertTrue("RFC 8017" in src and "PKCS #8" in src, "pull_web.py names the specs it follows")




class F14SlowGoogleNeverBlocksASave(unittest.TestCase):
    """A Pull now held the write lock for the whole Google call (up to 30 seconds), so every save waited."""

    def test_a_save_goes_through_during_a_slow_pull(self):
        import http.client, json, shutil, tempfile, threading, time
        from unittest import mock
        import serve, sync
        tmp = os.path.realpath(tempfile.mkdtemp())  # macOS: /var is a link to /private/var
        old = sync.SETTINGS_FILE, serve.files.ROOT, sync.CC_DATA
        sync.SETTINGS_FILE = os.path.join(tmp, "settings.json")
        sync.CC_DATA = os.path.join(tmp, "data")
        serve.files.ROOT = tmp
        started = threading.Event()

        def slow_pull():
            started.set(); time.sleep(3)
            raise serve.pull_web.WebPullError("no connection in this test")
        httpd = serve.ThreadingHTTPServer(("127.0.0.1", 0), serve.Handler)
        port = httpd.server_address[1]
        threading.Thread(target=httpd.serve_forever, daemon=True).start()

        def post(path, body):
            c = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
            c.request("POST", path, body=json.dumps(body).encode(), headers={"Host": "localhost", "Content-Type": "application/json"})
            r = c.getresponse(); r.read()
            return r.status
        try:
            with mock.patch.object(serve.pull_web, "pull", slow_pull), mock.patch.object(serve, "resync", lambda: False), \
                    mock.patch.object(serve, "state", lambda: {}):
                t = threading.Thread(target=post, args=("/api/web/pull", {}))
                t.start()
                self.assertTrue(started.wait(5), "the pull never started")
                t0 = time.time()
                self.assertEqual(post("/api/settings", {"poster": "manual"}), 200)
                self.assertLess(time.time() - t0, 2, "the save waited on the Google call")
                t.join(10)
        finally:
            httpd.shutdown()
            sync.SETTINGS_FILE, serve.files.ROOT, sync.CC_DATA = old
            shutil.rmtree(tmp, ignore_errors=True)


class FinalReviewMinors(unittest.TestCase):
    """From the final review: written files keep normal permissions; links aren't keys; _base can't lock a save."""

    def test_written_files_keep_their_mode(self):
        import stat, tempfile, sync
        d = os.path.realpath(tempfile.mkdtemp())
        p = os.path.join(d, "a.json")
        sync.write(p, "{}")
        self.assertNotEqual(stat.S_IMODE(os.stat(p).st_mode), 0o600, "a new file is readable like any other")
        os.chmod(p, 0o640)
        sync.write(p, "{ }")
        self.assertEqual(stat.S_IMODE(os.stat(p).st_mode), 0o640)
        sync.write(p, "x", 0o600)
        self.assertEqual(stat.S_IMODE(os.stat(p).st_mode), 0o600)

    def test_links_save_and_base_is_not_scanned(self):
        import shutil, tempfile, serve, sync
        tmp = os.path.realpath(tempfile.mkdtemp())
        old = sync.SETTINGS_FILE, serve.files.ROOT
        sync.SETTINGS_FILE, serve.files.ROOT = os.path.join(tmp, "settings.json"), tmp
        try:
            sheet = "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEFG/edit"
            serve.save_settings({"web": {"siteDomain": sheet}})
            serve.save_settings({"web": {"siteDomain": "example.com"}, "_base": {"web": {"siteDomain": "sk_live_" + "x" * 20}}})
            self.assertEqual(sync.load_settings()["web"]["siteDomain"], "example.com")
            with self.assertRaises(ValueError):
                serve.save_settings({"web": {"siteDomain": "sk_live_" + "x" * 20}})
        finally:
            sync.SETTINGS_FILE, serve.files.ROOT = old
            shutil.rmtree(tmp, ignore_errors=True)
