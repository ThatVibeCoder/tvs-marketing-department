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
        subprocess.run([sys.executable, "tools/add_team.py", "content-team"], cwd=self.repo, capture_output=True)
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
        with open(os.path.join(ROOT, "command-center", "assets", "editor.js"), encoding="utf-8") as f:
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


class F12GithubFetchNeverOverwrites(unittest.TestCase):
    """add_team.py --from-github wrote the fetched team over whatever was already in its library folder."""

    def test_an_existing_folder_is_left_alone(self):
        import json, tempfile, shutil
        from unittest import mock
        import add_team
        tmp = os.path.realpath(tempfile.mkdtemp())
        old = (add_team.ROOT, add_team.LIBRARY, add_team.DEPTS)
        try:
            add_team.ROOT, add_team.LIBRARY, add_team.DEPTS = tmp, os.path.join(tmp, "library", "teams"), os.path.join(tmp, "departments")
            mine = os.path.join(add_team.LIBRARY, "marketing", "ads-team", "notes.md")
            os.makedirs(os.path.dirname(mine))
            with open(mine, "w") as f:
                f.write("my own notes")
            api = {"library/teams": [{"name": "marketing", "type": "dir"}],
                   "library/teams/marketing": [{"name": "ads-team", "type": "dir"}],
                   "library/teams/marketing/ads-team": [{"type": "file", "path": "library/teams/marketing/ads-team/notes.md"},
                                                        {"type": "file", "path": "library/teams/marketing/ads-team/team.md"}]}
            def get(url):
                for k, v in api.items():
                    if url.endswith("/contents/" + k):
                        return json.dumps(v).encode()
                return b"from github"
            with mock.patch.object(add_team, "_get", side_effect=get):
                with self.assertRaises(SystemExit) as e:
                    add_team.fetch_from_github("ads-team")
            self.assertIn("already", str(e.exception))
            with open(mine) as f:
                self.assertEqual(f.read(), "my own notes")
            self.assertFalse(os.path.exists(os.path.join(add_team.LIBRARY, "marketing", "ads-team", "team.md")))
        finally:
            add_team.ROOT, add_team.LIBRARY, add_team.DEPTS = old
            shutil.rmtree(tmp, ignore_errors=True)

    def test_a_path_outside_the_library_is_refused(self):
        import json, tempfile, shutil
        from unittest import mock
        import add_team
        tmp = os.path.realpath(tempfile.mkdtemp())
        old = (add_team.ROOT, add_team.LIBRARY)
        try:
            add_team.ROOT, add_team.LIBRARY = tmp, os.path.join(tmp, "library", "teams")
            api = {"library/teams": [{"name": "marketing", "type": "dir"}], "library/teams/marketing": [{"name": "x-team", "type": "dir"}],
                   "library/teams/marketing/x-team": [{"type": "file", "path": "library/teams/marketing/x-team/../../../../tools/sync.py"}]}
            def get(url):
                for k, v in api.items():
                    if url.endswith("/contents/" + k):
                        return json.dumps(v).encode()
                return b"bad"
            with mock.patch.object(add_team, "_get", side_effect=get):
                with self.assertRaises(SystemExit):
                    add_team.fetch_from_github("x-team")
            self.assertFalse(os.path.exists(os.path.join(tmp, "tools", "sync.py")))
        finally:
            add_team.ROOT, add_team.LIBRARY = old
            shutil.rmtree(tmp, ignore_errors=True)
