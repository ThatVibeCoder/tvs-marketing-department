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
import business as b  # noqa: E402

DAY = datetime.date(2026, 11, 7)


class F1GuidesWithoutATemplate(unittest.TestCase):
    """contrarian-take.md and friction-points.md have no template: the first save kept deleting each guide."""

    def test_contrarian_first_save_keeps_the_guide(self):
        t = b.read("brand/contrarian-take.md")
        n = b.apply(t, {"sections": {"The Lead Take": "Most ads are wasted.", "The Enemy": "Boosted posts."}}, None, DAY)
        self.assertIn("## The Lead Take\nOne or two sentences, in your words, sharp enough to disagree with.\n\nMost ads are wasted.", n)
        self.assertIn("The common way of doing things that you're against. A practice, never a person.\n\nBoosted posts.", n)
        d = b.parse(n)
        self.assertEqual(b.section(d, "The Lead Take")["body"], "Most ads are wasted.")
        self.assertTrue(b.section(d, "The Lead Take")["guide"].startswith("One or two sentences"))
        # and a second edit replaces only the answer
        n2 = b.apply(n, {"sections": {"The Lead Take": "Most ads are guesses."}}, None, DAY)
        self.assertEqual(n2.count("One or two sentences, in your words"), 1)
        self.assertEqual(b.section(b.parse(n2), "The Lead Take")["body"], "Most ads are guesses.")

    def test_a_lightly_reworded_guide_is_still_a_guide(self):
        t = b.read("brand/icp.md").replace("What they want to be true instead, in the words they'd use to tell a friend.",
                                            "What they want instead, in words they'd tell a friend.")
        n = b.apply(t, {"sections": {"Dream State": "An easy yes."}}, b.guides_for("icp"), DAY)
        self.assertIn("What they want instead, in words they'd tell a friend.\n\nAn easy yes.", n)

    def test_filling_every_section_keeps_every_other_line(self):
        for rel in ("brand/contrarian-take.md", "brand/friction-points.md"):
            t = b.read(rel)
            d = b.parse(t)
            changes = {"sections": {s["title"]: "Filled." for s in d["sections"] if not s["fields"] and s["title"] != "Updates"}}
            n = b.apply(t, changes, None, DAY)
            kept = n.splitlines()
            for ln in t.splitlines():
                if ln.strip() and b.MARKER not in ln and not ln.startswith("_None yet._"):
                    self.assertIn(ln, kept, f"{rel}: lost the line {ln[:60]!r}")


class F2Fences(unittest.TestCase):
    """An unclosed ``` in one answer hid every later section, and the next edit crashed."""

    def test_an_unclosed_fence_ends_at_the_next_heading(self):
        t = b.read("brand/offer.md")
        g = b.guides_for("offer")
        n = b.apply(t, {"sections": {"The Offer": "Run this:\n```\npython3 go.py"}}, g, DAY)
        titles = [s["title"] for s in b.parse(n, g)["sections"]]
        self.assertEqual(titles, [s["title"] for s in b.parse(t, g)["sections"]])
        n2 = b.apply(n, {"sections": {"What It Costs": "$58"}, "update": "price"}, g, DAY)   # used to raise TypeError
        self.assertIn("$58", n2)
        self.assertEqual(n2.count("## Updates"), 1)

    def test_tilde_fences_count(self):
        t = "# X\n\n## A\nGuide.\n\n~~~\n## not a heading\n~~~\n\n## B\nGuide b.\n\n_Not filled in yet._\n"
        self.assertEqual([s["title"] for s in b.parse(t)["sections"]], ["A", "B"])

    def test_a_missing_section_is_a_plain_error(self):
        with self.assertRaises(ValueError):
            b._answer_span(["# X", "## A", "text"], "Nope", None)


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

    def test_business_save_after_an_outside_edit_is_refused(self):
        code, st = self.call("GET", "/api/state")
        doc = st["business"]["offers"][0]
        self.assertTrue(doc.get("hash"), "each business file carries the hash the page loaded")
        p = os.path.join(self.repo, "brand", "offer.md")
        with open(p, "a", encoding="utf-8") as f:
            f.write("\nAn AI's newer edit.\n")
        code, res = self.call("POST", "/api/business/save", {"path": doc["path"], "hash": doc["hash"], "changes": {"glance": {"Price": "$1"}}})
        self.assertEqual(code, 409, res)
        self.assertIn("changed since you opened it", res["error"])
        self.assertIn("An AI's newer edit.", self.text("brand/offer.md"))
        self.assertNotIn("Price: $1", self.text("brand/offer.md"))
        code, st = self.call("GET", "/api/state")
        fresh = st["business"]["offers"][0]["hash"]
        code, res = self.call("POST", "/api/business/save", {"path": doc["path"], "hash": fresh, "changes": {"glance": {"Price": "$1"}}})
        self.assertEqual(code, 200, res)
        self.assertIn("An AI's newer edit.", self.text("brand/offer.md"))

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
        with open(os.path.join(ROOT, "command-center", "assets", "business.js"), encoding="utf-8") as f:
            self.assertIn("hash: doc.hash", f.read())
        with open(os.path.join(ROOT, "command-center", "assets", "editor.js"), encoding="utf-8") as f:
            self.assertIn("hash:", f.read())


class F8Symlinks(ServerCase):
    """The repo couldn't be served from a symlinked folder, and saves followed symlinks out of the repo."""

    def test_writes_never_follow_a_symlink(self):
        outside = os.path.join(self.tmp, "outside.md")
        with open(outside, "w", encoding="utf-8") as f:
            f.write("# ICP: outside\n\n## Updates\nDated lines.\n")
        os.symlink(outside, os.path.join(self.repo, "brand", "icps", "linked.md"))
        code, res = self.call("POST", "/api/business/save", {"path": "brand/icps/linked.md", "changes": {"title": "ICP: hacked"}})
        self.assertEqual(code, 400, res)
        with open(outside, encoding="utf-8") as f:
            self.assertIn("ICP: outside", f.read())
        # a post file that's a link
        code, res = self.call("POST", "/api/posts", {"platform": "threads", "body": "Real."})
        pid = res["id"]; rel = [p for p in res["state"]["content"]["posts"] if p["id"] == pid][0]["path"]
        target = os.path.join(self.repo, rel)
        os.remove(target); os.symlink(outside, target)
        code, res = self.call("POST", "/api/posts/" + pid, {"body": "Overwrite?"})
        self.assertEqual(code, 400, res)
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
        self._old = (serve.ENV_FILE, serve.business.ROOT)
        serve.ENV_FILE = os.path.join(self.tmp, ".env")
        serve.business.ROOT = self.tmp

    def tearDown(self):
        import shutil
        self.serve.ENV_FILE, self.serve.business.ROOT = self._old
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
        for rel in ("tools/serve.py", "tools/business.py", "tools/pull_web.py"):
            with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
                plain = [ln.strip() for ln in f if "open(" in ln and '"w"' in ln]
            self.assertEqual(plain, [], f"{rel} still writes a file in place")

CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",) if os.path.exists(p)), None) or \
    next((p for p in (__import__("shutil").which("google-chrome"), __import__("shutil").which("chromium")) if p), None)


@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
class F4OfferBuilderKeepsStructure(unittest.TestCase):
    """The offer builder flattened ### subheads into bullets and dropped the 'and how' text of each friction line."""

    def test_structured_sections_survive_a_save(self):
        import json, re, shutil, subprocess, tempfile
        tmp = tempfile.mkdtemp()
        try:
            repo = os.path.join(tmp, "repo")
            shutil.copytree(ROOT, repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))
            sys.path.insert(0, os.path.join(repo, "tools"))
            get = "Core:\n- 6 calls\n### Bonus (first 10 buyers)\n- template pack"
            fr = "- Friction 1: Is it on time? Answered by the 2-day promise.\nThe rest is content."
            t = b.read("brand/offer.md")
            t = b.apply(t, {"sections": {"What They Get": get, "Friction It Answers": fr, "How It Works": "1. Pick\n2. Pay"}}, b.guides_for("offer"), DAY)
            with open(os.path.join(repo, "brand", "offer.md"), "w", encoding="utf-8") as f:
                f.write(t)
            subprocess.run([sys.executable, "tools/sync.py"], cwd=repo, capture_output=True)
            probe = """<!doctype html><meta charset="utf-8"><body><iframe id="f" src="index.html#/business/offers" style="width:1400px;height:1200px"></iframe><script>
const f = document.getElementById("f");
f.addEventListener("load", () => setTimeout(() => {
  const w = f.contentWindow, d = f.contentDocument, sent = [];
  w.eval("state.server = {}; api = async (path, body) => { window.__sent.push(body); return null; }; render();"); w.__sent = sent;
  setTimeout(() => {
    const areas = [...d.querySelectorAll('.offer-form textarea')].map((x) => x.value);
    const chips = [...d.querySelectorAll('.offer-form .chip-link')]; chips[1].click();
    const price = d.querySelectorAll('.offer-form input.field')[1]; price.value = "$99"; price.dispatchEvent(new Event("input"));
    d.querySelector('.offer-form .btn-primary').click();
    setTimeout(() => { const r = d.createElement ? document.createElement("pre") : null; r.id = "result"; r.textContent = JSON.stringify({ areas, sent }); document.body.append(r); }, 300);
  }, 300);
}, 800));
</script>"""
            with open(os.path.join(repo, "command-center", "probe.html"), "w", encoding="utf-8") as f:
                f.write(probe)
            r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={tmp}/chrome",
                                "--allow-file-access-from-files", "--virtual-time-budget=6000", "--dump-dom",
                                "file://" + os.path.join(repo, "command-center", "probe.html")], capture_output=True, text=True, timeout=60)
            m = re.search(r'<pre id="result">([^<]*)', r.stdout)
            self.assertIsNotNone(m, "the probe page didn't finish")
            out = json.loads(m.group(1).replace("&quot;", '"').replace("&amp;", "&").replace("&gt;", ">").replace("&lt;", "<"))
            self.assertIn(get, out["areas"], "What They Get isn't a plain list, so it's edited as text, structure and all")
            ch = out["sent"][0]["changes"]
            self.assertEqual(ch["glance"]["Price"], "$99")
            self.assertNotIn("What They Get", ch.get("sections", {}))       # untouched stays untouched
            self.assertNotIn("How It Works", ch.get("sections", {}))
            got = ch["sections"]["Friction It Answers"].split("\n")
            self.assertEqual(got[:2], ["- Friction 1: Is it on time? Answered by the 2-day promise.", "The rest is content."])
            self.assertTrue(got[2].startswith("- Friction 2"))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
