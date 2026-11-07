"""Settings saves merge instead of overwrite. Run: python3 -m unittest discover tests

The page sends what it changed and what it had (`_base`); serve.py applies only that change on top of
command-center/settings.json as it is now. So a tab opened before your AI edited settings.json can't put the
old values back.
"""
import json
import os
import shutil
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import serve  # noqa: E402
import sync  # noqa: E402

A = {"platform": "threads", "weekday": 3, "time": "10:00"}
B = {"platform": "linkedin", "weekday": 1, "time": "07:00"}
C = {"platform": "tiktok", "weekday": 5, "time": "18:00"}


class Merge(unittest.TestCase):
    def test_lists_merge_by_item(self):
        self.assertEqual(serve.merge3([A, C], [A], [A, B]), [A, C, B])   # the page added B; C came from outside
        self.assertEqual(serve.merge3([A, C], [A], []), [C])             # the page removed A; C stays
        self.assertEqual(serve.merge3([A], [A], [B, A]), [B, A])          # nobody else changed it: the page's order wins

    def test_objects_merge_by_field(self):
        cur = {"name": "Changed outside", "timezone": "Europe/London"}
        self.assertEqual(serve.merge3(cur, {"name": "Old", "timezone": "America/New_York"}, {"name": "Old", "timezone": "Asia/Tokyo"}),
                         {"name": "Changed outside", "timezone": "Asia/Tokyo"})

    def test_no_change_keeps_the_file(self):
        self.assertEqual(serve.merge3("from-file", "page-had", "page-had"), "from-file")


class StaleTab(unittest.TestCase):
    def setUp(self):
        self.tmp = os.path.realpath(tempfile.mkdtemp())
        self.file = os.path.join(self.tmp, "settings.json")
        self._old = sync.SETTINGS_FILE, serve.files.ROOT
        sync.SETTINGS_FILE = self.file
        serve.files.ROOT = self.tmp  # writes are only allowed inside the repo; this throwaway folder stands in for it

    def tearDown(self):
        sync.SETTINGS_FILE, serve.files.ROOT = self._old
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write(self, d):
        with open(self.file, "w", encoding="utf-8") as f:
            json.dump(d, f)

    def read(self):
        with open(self.file, encoding="utf-8") as f:
            return json.load(f)

    def test_an_old_tab_cant_put_back_an_outside_edit(self):
        self.write({"cadence": [A], "poster": "manual", "web": {"siteDomain": "old.example"}})
        # the page loaded that, then the AI edited the file
        self.write({"cadence": [A, C], "poster": "manual", "web": {"siteDomain": "new.example"}})
        serve.save_settings({"cadence": [A, B], "_base": {"cadence": [A]}})
        serve.save_settings({"web": {"siteDomain": "old.example", "otherName": "Plausible"}, "_base": {"web": {"siteDomain": "old.example"}}})
        got = self.read()
        self.assertEqual(got["cadence"], [A, C, B])
        self.assertEqual(got["web"], {"siteDomain": "new.example", "otherName": "Plausible"})
        self.assertNotIn("_base", got)

    def test_a_save_without_base_still_replaces(self):
        self.write({"cadence": [A, C]})
        serve.save_settings({"cadence": [B]})
        self.assertEqual(self.read()["cadence"], [B])

    def test_the_page_sends_its_base(self):
        with open(os.path.join(ROOT, "command-center", "assets", "settings.js"), encoding="utf-8") as f:
            self.assertIn("_base: Object.fromEntries(Object.keys(patch)", f.read())


if __name__ == "__main__":
    unittest.main()
