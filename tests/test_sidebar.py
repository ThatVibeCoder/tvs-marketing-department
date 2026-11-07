"""The sidebar's highlighted pill follows the section you open. Run: python3 -m unittest discover tests

Brian's report: on a Web page, he opened My Business (its pages dropped down) and the pill stayed on
Web & Analytics. This opens the real page in headless Chrome inside a small probe page, clicks the section
header the way he did, and reads which section is lit. Skipped when Chrome isn't installed.
"""
import os
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "") if p and os.path.exists(p)), None)

PROBE = """<!doctype html><meta charset="utf-8"><body><iframe id="f" src="index.html#%(start)s" style="width:1400px;height:900px"></iframe>
<script>
const f = document.getElementById("f");
const doc = () => f.contentDocument;
const lit = () => [...doc().querySelectorAll("button.rail-mod-btn.in-section, a.rail-link[aria-current=page]")].map((b) => b.dataset.label || b.textContent.trim()).join(",");
const cur = () => [...doc().querySelectorAll(".rail-child[aria-current=page]")].map((a) => a.textContent).join(",");
const steps = %(steps)s, out = [];
f.addEventListener("load", () => setTimeout(function next() {
  out.push(lit() + "/" + cur());
  const s = steps.shift();
  if (!s) { const r = document.createElement("pre"); r.id = "result"; r.textContent = out.join("|"); document.body.append(r); return; }
  if (s.startsWith("#")) f.contentWindow.location.hash = s; else doc().querySelector('button.rail-mod-btn[data-label="' + s + '"]').click();
  setTimeout(next, 250);
}, 800));
</script>"""


@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
class SidebarHighlight(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_probe(self, start, steps):
        with open(os.path.join(self.repo, "command-center", "probe.html"), "w", encoding="utf-8") as f:
            f.write(PROBE % {"start": start, "steps": repr(steps).replace("'", '"')})
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--allow-file-access-from-files", "--virtual-time-budget=6000", "--dump-dom",
                            "file://" + os.path.join(self.repo, "command-center", "probe.html")], capture_output=True, text=True, timeout=60)
        m = re.search(r'<pre id="result">([^<]*)', r.stdout)
        self.assertIsNotNone(m, "the probe page didn't finish")
        return m.group(1).replace("&amp;", "&").split("|")

    def test_opening_another_section_moves_the_pill(self):
        start, content, closed = self.run_probe("/web/traffic", ["Content", "Content"])
        self.assertEqual(start, "Web & Analytics/Traffic")      # on a Web page: Web is lit, Traffic is the current page
        self.assertEqual(content, "Content/")                  # Brian's click: the pill moves; no Content page is current
        self.assertEqual(closed, "Web & Analytics/")           # every section closed: back to the page's own section

    def test_every_section(self):
        out = self.run_probe("/dashboard", ["Content", "Web & Analytics", "Automations"])
        self.assertEqual(out, ["Dashboard/", "Content/", "Web & Analytics/", "Automations/"])

    def test_a_section_left_open_isnt_lit_on_another_page(self):
        # on a Web page Web is open; go to the Dashboard: Web stays open (remembered) but nothing is lit
        start, dash, opened = self.run_probe("/web/traffic", ["#/dashboard", "Content"])
        self.assertEqual(start, "Web & Analytics/Traffic")
        self.assertEqual(dash, "Dashboard/")
        self.assertEqual(opened, "Content/")

    def test_one_pill_only(self):
        # Brian's 2:16 screenshot: on the Dashboard, opening a section lit Dashboard AND the section
        start, opened, closed = self.run_probe("/dashboard", ["Content", "Content"])
        self.assertEqual(start, "Dashboard/")
        self.assertEqual(opened, "Content/")       # the section has the pill; Dashboard gave it up
        self.assertEqual(closed, "Dashboard/")     # closed again: back on the page you're on

