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
    Erstellt eine klickbare Liste in Streamlit.

    :param options: Eine Liste von Dictionaries mit { "id": int, "name": str, "level": int }
    :param indent: Der Multiplikator des Levels, left-margin in px.
    :param style: CSS Style für Items
    :param key: Optionaler Streamlit Key
    :return: Die ID des geklickten Items
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