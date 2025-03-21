# Clickable list

This Streamlit component renders an indented, hierarchical list with clickable items. When a user clicks on an item, the component returns the ID of that item, making it perfect for navigation menus, tree structures, or any interactive nested list.

## Installation 

Since this component is not yet published on PyPI, you have several options to install it:

### Option 1: Clone the repository
```
git clone https://github.com/yourusername/clickable-list.git
cd clickable-list
pip install -e .
```

### Option 2: Use as Git Submodule
```
# In your project directory
git submodule add https://github.com/yourusername/clickable-list.git
pip install -e ./clickable-list
```

# Option 3: Install Directly from GitHub
```
pip install git+https://github.com/yourusername/clickable-list.git
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

### Advanced usage
#### Custom styling

You can customize the look of your items by passing CSS as string.

```css
custom_style = """
    padding: 5px;
    border-radius: 3px;
    margin: 2px 0;
    cursor: pointer;
    font-family: 'sans serif';
"""

clickable_list(
    options=example_options,
    indent=20,
    style=custom_style
)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.