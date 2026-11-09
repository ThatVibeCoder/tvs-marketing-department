"""A post made on a calendar day gets a time, and approving a dated post keeps one. Run: python3 -m unittest discover tests

The time comes from the platform's posting cadence (that weekday's first time, else its first time on any
day), else 9:00 AM. Checked in the real page (headless Chrome, skipped without it): the composer's new post and
the time an approval would book.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "") if p and os.path.exists(p)), None)
PROBE = """<!doctype html><meta charset="utf-8"><body><iframe id="f" src="index.html#/content/calendar"></iframe><script>
const f = document.getElementById("f");
f.addEventListener("load", () => setTimeout(() => {
  const w = f.contentWindow, out = [];
  for (const [platform, day] of %s) { w.openComposer({ create: { platform, date: day } }); out.push(w.eval("comp.time")); w.closeComposer(true); }
  const r = document.createElement("pre"); r.id = "result"; r.textContent = out.join("|"); document.body.append(r);
}, 800));
</script>"""


@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
class PostTimes(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def times(self, cadence, cases):
        with open(os.path.join(self.repo, "dashboard", "settings.json"), "w", encoding="utf-8") as f:
            json.dump({"cadence": cadence}, f)
        subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True)
        with open(os.path.join(self.repo, "dashboard", "probe.html"), "w", encoding="utf-8") as f:
            f.write(PROBE % json.dumps(cases))
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--allow-file-access-from-files", "--virtual-time-budget=5000", "--dump-dom",
                            "file://" + os.path.join(self.repo, "dashboard", "probe.html")], capture_output=True, text=True, timeout=60)
        m = re.search(r'<pre id="result">([^<]*)', r.stdout)
        self.assertIsNotNone(m, "the probe page didn't finish")
        return m.group(1).split("|")

    def test_a_calendar_day_gets_a_time(self):
        cadence = [{"platform": "threads", "weekday": 3, "time": "10:00"}, {"platform": "threads", "weekday": 3, "time": "08:30"},
                   {"platform": "threads", "weekday": 5, "time": "16:15"}, {"platform": "linkedin", "weekday": 1, "time": "07:00"}]
        # 2026-11-11 is a Wednesday, 2026-11-13 a Friday, 2026-11-14 a Saturday
        got = self.times(cadence, [["threads", "2026-11-11"], ["threads", "2026-11-13"], ["threads", "2026-11-14"], ["linkedin", "2026-11-11"], ["skool", "2026-11-11"]])
        self.assertEqual(got, ["08:30", "16:15", "08:30", "07:00", "09:00"])

    def test_approving_a_dated_post_keeps_a_time(self):
        """decide() is what the Approve button runs; the save it sends is captured instead of sent."""
        with open(os.path.join(self.repo, "dashboard", "settings.json"), "w", encoding="utf-8") as f:
            json.dump({"cadence": [{"platform": "threads", "weekday": 3, "time": "10:00"}]}, f)
        subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True)
        probe = """<!doctype html><meta charset="utf-8"><body><iframe id="f" src="index.html#/content/threads/review"></iframe><script>
const f = document.getElementById("f");
f.addEventListener("load", () => setTimeout(async () => {
  const w = f.contentWindow, sent = [];
  w.eval("api = async (path, body) => { window.__sent.push(body); return {}; }"); w.__sent = sent;
  await w.decide({ id: "a", platform: "threads", status: "draft", date: "2026-11-11", time: "" }, "approved", null);
  await w.decide({ id: "b", platform: "threads", status: "draft", date: "2026-11-11", time: "18:00" }, "approved", null);
  const r = document.createElement("pre"); r.id = "result"; r.textContent = JSON.stringify(sent); document.body.append(r);
}, 800));
</script>"""
        with open(os.path.join(self.repo, "dashboard", "probe.html"), "w", encoding="utf-8") as f:
            f.write(probe)
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--allow-file-access-from-files", "--virtual-time-budget=5000", "--dump-dom",
                            "file://" + os.path.join(self.repo, "dashboard", "probe.html")], capture_output=True, text=True, timeout=60)
        m = re.search(r'<pre id="result">([^<]*)', r.stdout)
        self.assertIsNotNone(m, "the probe page didn't finish")
        sent = json.loads(m.group(1).replace("&quot;", '"'))
        self.assertEqual(sent[0], {"status": "approved", "time": "10:00"})   # a dated post with no time gets the day's time
        self.assertEqual(sent[1], {"status": "approved"})                   # a time it already has is left alone


if __name__ == "__main__":
    unittest.main()
