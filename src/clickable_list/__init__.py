from pathlib import Path
from typing import Optional, List, Dict
import streamlit as st
import streamlit.components.v1 as components

frontend_dir = (Path(__file__).parent / "frontend").absolute()
_component_func = components.declare_component("clickable_list", path=str(frontend_dir))

def clickable_list(options: List[Dict[str, int]], indent=20 , style=None, key: Optional[str] = None):
    """
    Erstellt eine klickbare Liste in Streamlit.

    :param options: Eine Liste von Dictionaries mit { "id": int, "name": str, "level": int }
    :param indent: Der Multiplikator des Levels, left-margin in px.
    :param style: CSS Style für Items
    :param key: Optionaler Streamlit Key
    :return: Die ID des geklickten Items
    """
    return _component_func(options=options, indent=indent, style=style, key=key)
