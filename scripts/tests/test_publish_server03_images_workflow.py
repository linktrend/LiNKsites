from __future__ import annotations

import os
import subprocess
import textwrap
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = (ROOT / ".github" / "workflows" / "publish-server03-images.yml").read_text(encoding="utf-8")


class PublishServer03ImagesWorkflowTests(unittest.TestCase):
    def run_origin_validator(self, value: str) -> subprocess.CompletedProcess[str]:
        section = WORKFLOW.split("- name: Require private CMS HTTPS origin for web-master", 1)[1]
        script = section.split("python3 - <<'PY'\n", 1)[1].split("\n          PY", 1)[0]
        return subprocess.run(
            ["python3", "-c", textwrap.dedent(script)],
            env={**os.environ, "CMS_PRIVATE_HTTPS_URL": value},
            text=True,
            capture_output=True,
            check=False,
        )

    def test_cms_origin_requires_a_real_host_only_origin(self) -> None:
        self.assertIn('host = (parsed.hostname or "").lower()', WORKFLOW)
        self.assertIn('value != raw_value', WORKFLOW)
        self.assertIn('or not raw_value.isascii()', WORKFLOW)
        self.assertIn('or host_is_ip_address', WORKFLOW)
        self.assertIn('or reserved_hostname', WORKFLOW)
        self.assertIn('or not host', WORKFLOW)
        self.assertIn('or host != "cms.linktrend.one"', WORKFLOW)
        self.assertIn('or not valid_hostname', WORKFLOW)
        self.assertIn('parsed.path not in {"", "/"}', WORKFLOW)
        self.assertIn('or parsed.params', WORKFLOW)
        self.assertIn('or parsed.query', WORKFLOW)
        self.assertIn('or parsed.fragment', WORKFLOW)
        self.assertIn('except ValueError as error:', WORKFLOW)
        self.assertIn('len(labels) >= 2', WORKFLOW)
        self.assertIn('and label.isascii()', WORKFLOW)

        self.assertEqual(self.run_origin_validator("https://cms.linktrend.one").returncode, 0)
        self.assertEqual(self.run_origin_validator("https://cms.linktrend.one/").returncode, 0)
        for invalid in (
            "https://",
            "https:///cms",
            "https://localhost",
            "https://cms",
            "https://cms.linktrend.one/path",
            "https://cms.linktrend.one?wrong=origin",
            "https://cms.linktrend.one#fragment",
            "https://cms.linktrend.one:invalid",
            "https://cms.línktrend.one",
            "https://cms.local",
            "https://cms.localhost",
            "https://attacker.invalid",
            "https://attacker.test",
            "https://attacker.example",
            "https://10.0.0.1",
            "https://192.168.1.1",
            "https://169.254.1.1",
            "https://8.8.8.8",
            "https://010.000.000.001",
            "https://0x7f.0x0.0x0.0x1",
            "https://cms.other-company.com",
            " https://cms.linktrend.one",
            "https://cms.linktrend.one ",
            "\thttps://cms.linktrend.one\n",
            "\u00a0https://cms.linktrend.one",
            "https://cms.linktrend.one\u00a0",
        ):
            with self.subTest(invalid=invalid):
                result = self.run_origin_validator(invalid)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("cms_private_https_url_must_be_a_private_https_origin", result.stderr)

    def test_publication_remains_exact_main_and_immutable(self) -> None:
        self.assertIn("test \"${WORKFLOW_REF}\" = 'refs/heads/main'", WORKFLOW)
        self.assertIn('release_sha_must_be_a_full_lowercase_sha', WORKFLOW)
        self.assertIn('requested_release_is_not_in_protected_main_history', WORKFLOW)
        self.assertIn('immutable_release_tag_already_exists=', WORKFLOW)
        self.assertNotIn(':latest', WORKFLOW)


if __name__ == "__main__":
    unittest.main()
