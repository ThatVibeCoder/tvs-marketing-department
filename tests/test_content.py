"""Tests for the Content pages' data and tools/serve.py. Run: python3 -m unittest discover tests

Each test copies the repo into a temp folder, writes or edits post files the way the Content Team
and the Command Center's editor do, and checks what lands on disk. Your own repo is never touched.
"""
import http.client
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shipped import AS_SHIPPED, WHY  # noqa: E402  (template-only tests skip in a member's repo)
from fixtures import add_content_team  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = "departments/marketing/content-team/social-manager/posts"


@unittest.skipUnless(AS_SHIPPED, WHY)
class RepoCopy(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))
        # posts live with the Content Team's Social Manager; its lesson builds it, so write a stand-in
        add_content_team(self.repo)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write(self, rel_path, text):
        p = os.path.join(self.repo, rel_path)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)

    def read(self, rel_path):
        with open(os.path.join(self.repo, rel_path), encoding="utf-8") as f:
            return f.read()

    def sync(self, *args):
        r = subprocess.run([sys.executable, "tools/sync.py", *args], cwd=self.repo,
                           capture_output=True, text=True, encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def content(self):
        return json.loads(self.read("command-center/data/content.json"))


class ContentTest(RepoCopy):

    def test_template_ships_no_posts(self):
        code, out = self.sync("--check")
        self.assertEqual(code, 0, out)
        self.assertEqual(self.content()["posts"], [])

    def test_a_drafted_post_shows_up(self):
        self.write(f"{POSTS}/2026-11-07-threads-first.md",
                   '---\nplatform: threads\nstatus: draft\ndate: 2026-11-07\ntime: "09:30"\n---\n'
                   "The post.\n---\nIts reply.\n")
        code, out = self.sync()
        self.assertEqual(code, 0, out)
        post = self.content()["posts"][0]
        self.assertEqual((post["id"], post["platform"], post["status"], post["time"]), ("2026-11-07-threads-first", "threads", "draft", "09:30"))
        self.assertEqual(post["body"], "The post.\n---\nIts reply.")
        self.assertIn('"content":', self.read("command-center/data/data.js"))
        code, out = self.sync("--check")
        self.assertEqual(code, 0, out)

    def test_skool_title_and_media_type(self):
        self.write(f"{POSTS}/a.md", '---\nplatform: skool\ntitle: "Wins: this week"\ncategory: Wins\nmedia: recordings/clip.mp4\n---\nBody\n')
        self.sync()
        post = self.content()["posts"][0]
        self.assertEqual((post["title"], post["category"], post["mediaType"], post["status"]), ("Wins: this week", "Wins", "video", "draft"))

    def test_bad_post_header_is_a_fix(self):
        self.write(f"{POSTS}/bad.md", "---\nplatform: myspace\nstatus: draft\n---\nHi\n")
        code, out = self.sync("--check")
        self.assertEqual(code, 1, out)
        self.assertIn("FIX:", out)
        self.assertIn("bad.md", out)

    def test_research_reads_knowledge(self):
        self.sync()
        research = self.content()["research"]
        self.assertEqual(research["topics"]["path"], "knowledge/topics.md")
        self.assertEqual(research["competitors"], [])  # the _template.md and README never count


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class ServeTest(RepoCopy):
    def setUp(self):
        super().setUp()
        self.write(f"{POSTS}/p1.md", "---\nplatform: linkedin\nstatus: draft\n---\nOld words.\n")
        self.sync()
        self.port = free_port()
        self.proc = subprocess.Popen([sys.executable, "tools/serve.py", "--port", str(self.port)], cwd=self.repo,
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                self.call("GET", "/api/health")
                break
            except OSError:
                time.sleep(0.1)

    def tearDown(self):
        self.proc.terminate()
        self.proc.wait(5)
        super().tearDown()

    def call(self, method, path, body=None, host="localhost"):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        headers = {"Host": host}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        c.request(method, path, body=data, headers=headers)
        r = c.getresponse()
        raw = r.read()
        return r.status, (json.loads(raw) if raw[:1] in (b"{", b"[") else raw)

    def test_save_changes_writes_the_file(self):
        code, res = self.call("POST", "/api/posts/p1", {"body": "New words.", "status": "approved", "date": "2026-11-09", "time": "12:00"})
        self.assertEqual(code, 200, res)
        text = self.read(f"{POSTS}/p1.md")
        self.assertIn("New words.", text)
        self.assertIn("status: approved", text)
        self.assertIn('time: "12:00"', text)
        self.assertTrue(res["synced"]["ok"])
        self.assertEqual(self.content()["posts"][0]["body"], "New words.")  # sync ran after the save

    def test_create_and_duplicate(self):
        code, res = self.call("POST", "/api/posts", {"platform": "twitter", "body": "Hello there", "date": "2026-11-10"})
        self.assertEqual(code, 200, res)
        self.assertTrue(os.path.isfile(os.path.join(self.repo, POSTS, res["id"] + ".md")))
        code, dup = self.call("POST", f"/api/posts/{res['id']}/duplicate", {})
        self.assertEqual(code, 200, dup)
        self.assertNotEqual(dup["id"], res["id"])
        self.assertIn("status: draft", self.read(f"{POSTS}/{dup['id']}.md"))

    def test_keys_go_to_env_and_never_come_back(self):
        code, res = self.call("POST", "/api/keys", {"name": "BLOTATO_API_KEY", "value": "secret-123"})
        self.assertEqual(code, 200, res)
        self.assertIn("BLOTATO_API_KEY=secret-123", self.read(".env"))
        self.assertNotIn("secret-123", json.dumps(res))
        self.assertTrue(res["state"]["keys"]["BLOTATO_API_KEY"])
        code, res = self.call("POST", "/api/keys", {"name": "SOMETHING_ELSE", "value": "x"})
        self.assertEqual(code, 400)

    def test_settings_save_but_refuse_keys(self):
        code, res = self.call("POST", "/api/settings", {"poster": "blotato", "cadence": [{"platform": "instagram", "weekday": 1, "time": "09:30"}]})
        self.assertEqual(code, 200, res)
        saved = json.loads(self.read("command-center/settings.json"))
        self.assertEqual(saved["poster"], "blotato")
        code, _ = self.call("POST", "/api/settings", {"account": {"name": "BLOTATO_API_KEY=abc"}})
        self.assertEqual(code, 400)

    def test_web_key_is_checked_folded_and_never_echoed(self):
        self.assertEqual(self.call("POST", "/api/keys", {"name": "GA_SERVICE_ACCOUNT_KEY", "value": "not json"})[0], 400)
        sa = {"type": "service_account", "client_email": "reader@example.iam.gserviceaccount.com",
              "private_key": "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n"}
        code, res = self.call("POST", "/api/keys", {"name": "GA_SERVICE_ACCOUNT_KEY", "value": json.dumps(sa, indent=2)})
        self.assertEqual(code, 200, res)
        env = self.read(".env")
        self.assertEqual(len([ln for ln in env.splitlines() if ln.startswith("GA_SERVICE_ACCOUNT_KEY=")]), 1)
        self.assertNotIn("reader@example", json.dumps(res))
        self.assertEqual(self.call("POST", "/api/keys", {"name": "GA_PROPERTY_ID", "value": "G-ABC123"})[0], 400)
        code, res = self.call("POST", "/api/web/test", {})
        self.assertEqual(code, 200, res)
        self.assertIn("property id", res["test"]["analytics"])  # stops before calling Google
        self.assertIsNone(res["state"]["web"])

    def test_only_localhost_and_only_the_repo(self):
        self.assertEqual(self.call("GET", "/api/state", host="evil.example")[0], 403)
        self.assertEqual(self.call("GET", "/../tools/serve.py")[0], 404)
        self.write(".env", "X=1\n")
        self.assertEqual(self.call("GET", "/repo/.env")[0], 404)
        self.assertEqual(self.call("POST", "/api/posts/../../x", {"body": "x"})[0], 404)


if __name__ == "__main__":
    unittest.main()
