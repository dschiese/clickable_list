# clickable_list

A Streamlit component that renders an indented, tree-like clickable list and returns the clicked item ID.

## Features

- Hierarchical list rendering using `level`
- Configurable indentation (`indent`)
- Optional custom CSS (`style`)
- Optional callback hook (`on_change`)

## Installation

Install directly from GitHub:

```bash
pip install git+https://github.com/dschiese/clickable_list.git
```

Or install locally for development:

```bash
git clone https://github.com/dschiese/clickable_list.git
cd clickable_list
pip install -e .
```

## Usage

```python
import streamlit as st
from clickable_list import clickable_list

options = [
    {"id": 1, "name": "Method A", "level": 0},
    {"id": 2, "name": "Method B", "level": 1},
    {"id": 3, "name": "Method C", "level": 2},
]

selected = clickable_list(options, indent=20)
st.write("Selected:", selected)
```

## API

`clickable_list(options, indent=10, key=None, style=None, on_change=None, args=(), kwargs=None)`

- `options`: list of dicts with `id`, `name`, `level`
- `indent`: left spacing per hierarchy level in pixels
- `key`: Streamlit component key
- `style`: CSS string applied to list items
- `on_change`: callback executed after selection change

## Local Demo

```bash
streamlit run src/app.py
```

## License

MIT (see `LICENSE`).
