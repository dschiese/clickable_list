# Clickable list

This streamlit component renders a indented list with clickable items which are the actual value of the assigned variable.

## Installation instructions 

```sh
pip install clickable-list
```

## Usage instructions

```python
import streamlit as st
from clickable_list import clickable_list

example_options = [
        {"id": 1, "name": "Method A", "level": 0},
        {"id": 2, "name": "Method B", "level": 1},
        {"id": 3, "name": "Method C", "level": 2},
]

response = clickable_list(example_options, indent=20)

st.write(response)
```
