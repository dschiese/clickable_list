from pathlib import Path
from typing import Optional, List, Dict
import streamlit as st
import streamlit.components.v1 as components

frontend_dir = (Path(__file__).parent / "frontend").absolute()
_component_func = components.declare_component("clickable_list", path=str(frontend_dir))

def clickable_list(
    options: List[Dict[str, any]],
    indent: int = 10,
    key: Optional[str] = None,
    style: Optional[str] = None,
    on_change: Optional[callable] = None,
    args: Optional[tuple] = (),
    kwargs: Optional[dict] = None
) -> Optional[str]:
    """
    Creates a clickable list in Streamlit.

    Parameters:
        options (List[Dict]): A list of dictionaries with { "id": any, "name": str, "level": int }.
                             - id: Unique identifier for the item
                             - name: Display text for the item
                             - level: Indentation level (0 for root, 1+ for nested items)
        indent (int): The level-wise indent left-margin in pixels. Default is 10.
        key (str, optional): A unique key for the component. Useful when using multiple instances.
        style (str, optional): CSS style string to apply to list items.
        on_change (callable, optional): Function to call when a list item is clicked.
        args (tuple, optional): Additional arguments to pass to on_change.
        kwargs (dict, optional): Additional keyword arguments to pass to on_change.
    
    Returns:
        Optional[str]: The ID of the clicked item or None if no item was clicked.
    """
    component_value = _component_func(
        options=options,
        indent=indent,
        key=key,
        style=style
    )

    # Handle on_change callback if defined
    if component_value is not None and on_change:
        if args or kwargs:
            on_change(*args, **(kwargs or {}))
        else:
            on_change()

    return component_value