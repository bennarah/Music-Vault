from pathlib import Path
import re

css = Path("frontend/src/index.css").read_text()

def luminance(hex_color):
    values = [
        int(hex_color[i:i+2], 16) / 255
        for i in (1, 3, 5)
    ]

    linear = [
        value / 12.92 if value <= 0.04045
        else ((value + 0.055) / 1.055) ** 2.4
        for value in values
    ]

    return (
        0.2126 * linear[0]
        + 0.7152 * linear[1]
        + 0.0722 * linear[2]
    )

def contrast(first, second):
    light, dark = sorted(
        [luminance(first), luminance(second)],
        reverse=True
    )
    return (light + 0.05) / (dark + 0.05)

def get_variables(section):
    return dict(re.findall(
        r"(--color-[\w-]+):\s*(#[0-9a-fA-F]{6})",
        section
    ))

dark_section, light_section = css.split(
    '[data-theme="light"]', 1
)

themes = {
    "Dark": get_variables(dark_section),
    "Light": get_variables(light_section),
}

checks = [
    ("Primary text", "text", "bg", 4.5),
    ("Muted text", "text-muted", "bg", 4.5),
    ("Card text", "text", "surface", 4.5),
    ("Muted card text", "text-muted", "surface", 4.5),
    ("Accent text", "accent", "bg", 4.5),
    ("Button text", "accent-text", "accent", 4.5),
    ("Hover button text", "accent-text", "accent-hover", 4.5),
    ("Input border", "border", "surface", 3.0),
    ("Focus outline", "focus", "bg", 3.0),
    ("Focus on card", "focus", "surface", 3.0),
]

failed = False

for theme_name, variables in themes.items():
    print(f"\n{theme_name.upper()} THEME")
    print("-" * 65)

    for label, foreground, background, minimum in checks:
        first = variables[f"--color-{foreground}"]
        second = variables[f"--color-{background}"]

        ratio = contrast(first, second)
        passed = ratio >= minimum

        if not passed:
            failed = True

        result = "PASS" if passed else "FAIL"

        print(
            f"{result:4} | {label:24} | "
            f"{ratio:5.2f}:1 | minimum {minimum}:1"
        )

print("\nRESULT:", "FAILURES FOUND" if failed else "ALL CHECKS PASSED")

raise SystemExit(1 if failed else 0)
