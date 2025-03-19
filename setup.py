from pathlib import Path

import setuptools

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setuptools.setup(
    name="clickable-list",
    version="0.1.0",
    author="Dennis Schiese",
    author_email="dennis.schiese@htwk-leipzig.de",
    description="Streamlit component that renders a indented list (tree-like) and returns the clicked item",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(where="src"),
    package_dir={"": "src"},
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.7",
    install_requires=["streamlit>=1.2", "jinja2"],
)
