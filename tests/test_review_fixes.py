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


class F3StaleSaves(unittest.TestCase):
    """A save from a page opened before someone else edited the file used to wipe their edit. Now it's a 409."""

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


if __name__ == "__main__":
    unittest.main()
