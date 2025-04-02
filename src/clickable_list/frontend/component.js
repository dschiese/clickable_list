// Add state management at the top of the file
// This will persist between re-renders
let collapsedNodes = new Set();

/**
 * Creates a list node (li or ul) based on item properties
 * @param {Object} item - The item dictionary 
 * @param {Array} options - All options array for context
 * @param {number} index - Current options index
 * @param {number} indent - Indentation in pixels
 * @param {string} style - CSS style to apply
 * @returns {HTMLElement} The created DOM node
 */
function createListNode(item, options, index, indent, style) {
  // Determine if this should be a parent node (ul) or leaf node (li)
  const isParentNode = index < options.length - 1 && options[index + 1].level > item.level;
  const node = document.createElement(isParentNode ? "ul" : "li");
  
  // Add collapsible class if node is a parent node
  if (isParentNode) {
    node.classList.add("collapsible");
    
    // Check if this node was previously collapsed
    // Use a combination of id and name to create a unique identifier
    const nodeId = `${item.id || ''}-${item.name || ''}-${item.level}`;
    if (collapsedNodes.has(nodeId)) {
      node.classList.add("collapsed");
    }
  }
  
  // Set id for the node
  node.id = item.id;
  
  // Clear any existing content
  node.innerHTML = "";
  
  // Create container for the node content
  const contentContainer = document.createElement("div");
  contentContainer.style.display = "flex";
  contentContainer.style.alignItems = "center";
  
  // Determine hierarchy symbol for children
  let hierarchySymbol = "";
  if (item.level > 0) {
    // Check if this is the last item at this level within its parent
    let isLastChild = true;
    for (let i = index + 1; i < options.length; i++) {
      if (options[i].level < item.level) {
        // We've gone back up the hierarchy, so stop checking
        break;
      }
      
      if (options[i].level === item.level) {
        isLastChild = false;
        break;
      }
    }
    
    hierarchySymbol = isLastChild ? "┕ " : "┝ ";
  }
  
  // Create non-clickable span for hierarchy symbol
  if (hierarchySymbol) {
    const symbolSpan = document.createElement("span");
    symbolSpan.className = "hierarchy-symbol";
    
    // Add collapse indicator for parent nodes
    if (isParentNode) {
      const isCollapsed = collapsedNodes.has(`${item.id || ''}-${item.name || ''}-${item.level}`);
      symbolSpan.textContent = hierarchySymbol;
      symbolSpan.style.cursor = "pointer";
      
      // Add click handler for collapsing
      symbolSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        const nodeId = `${item.id || ''}-${item.name || ''}-${item.level}`;
        
        if (node.classList.contains("collapsed")) {
          // Uncollapse
          node.classList.remove("collapsed");
          collapsedNodes.delete(nodeId);
          symbolSpan.textContent = hierarchySymbol;
        } else {
          // Collapse
          node.classList.add("collapsed");
          collapsedNodes.add(nodeId);
          symbolSpan.textContent = hierarchySymbol;
        }
      });
    } else {
      symbolSpan.textContent = hierarchySymbol;
    }
    
    contentContainer.appendChild(symbolSpan);
  }
  
  // Create clickable span for the item name
  const nameSpan = document.createElement("span");
  nameSpan.textContent = item.name;
  nameSpan.classList.add("clickable-text");
  
  // Attach the click handler to just the name span
  nameSpan.addEventListener("click", (e) => {
    e.stopPropagation();
    // When clicking on the name, preserve the current state of collapsed nodes
    const state = {
      ...item,
      collapsedState: Array.from(collapsedNodes)
    };
    Streamlit.setComponentValue(state);
  });
  
  contentContainer.appendChild(nameSpan);
  node.appendChild(contentContainer);

  // Apply indentation for nested items
  if (item.level > 0) {
    node.style.marginLeft = `${indent}px`;
  }
  
  // Apply custom style if provided
  if (style) {
    node.style.cssText += style;
  }
  
  return node;
}

/**
 * Updates the parent stack based on level changes
 * @param {Array} parentStack - Stack of parent elements
 * @param {number} currentLevel - Current level in the hierarchy
 * @param {number} newLevel - New level to navigate to
 * @returns {Object} Updated context { parentStack, currentLevel }
 */
function updateParentStack(parentStack, currentLevel, newLevel) {
  const updatedStack = [...parentStack];
  let updatedLevel = currentLevel;
  
  if (newLevel > currentLevel) {
    // Going deeper in the hierarchy - previous node becomes parent
    const newParent = updatedStack[updatedStack.length - 1].lastChild;
    if (newParent) {
      updatedStack.push(newParent);
    }
  } else if (newLevel < currentLevel) {
    // Moving back up the hierarchy - pop parents from stack
    while (updatedLevel > newLevel && updatedStack.length > 1) {
      updatedStack.pop();
      updatedLevel--;
    }
  } else {
    // Same level, no changes needed
    return { parentStack: updatedStack, currentLevel: updatedLevel };
  }
  
  return { parentStack: updatedStack, currentLevel: newLevel };
}

/**
 * Updates the hierarchy state after adding a node
 * @param {HTMLElement} node - The added node
 * @param {Array} parentStack - Current parent stack
 * @param {number} currentLevel - Current level
 * @param {number} itemLevel - Item's level
 * @returns {Object} Updated state { parentStack, currentLevel }
 */
function updateHierarchyState(node, parentStack, currentLevel, itemLevel) {
  const updatedStack = [...parentStack];
  let updatedLevel = currentLevel;
  
  if (node.nodeName === "UL") {
    updatedStack.push(node);
    updatedLevel = itemLevel + 1;
  } else {
    updatedLevel = itemLevel;
  }
  
  return { parentStack: updatedStack, currentLevel: updatedLevel };
}

/**
 * Renders the clickable list component
 * @param {Object} data - The component data from Streamlit
 */
function renderComponent(data) {
  if (!data || !data.options) return;

  let height = data.options.length * 35;
  const output = document.getElementById("root");
  output.innerHTML = "";
  
  let parentStack = [output];
  let currentLevel = 0;
  
  for (let i = 0; i < data.options.length; i++) {
    const item = data.options[i];
    const level = item.level;
    
    // First update parent stack based on level change
    const stackResult = updateParentStack(parentStack, currentLevel, level);
    parentStack = stackResult.parentStack;
    currentLevel = stackResult.currentLevel;
    
    // Create the appropriate node
    const node = createListNode(item, data.options, i, data.indent, data.style);
    
    // Append to the current parent in the stack
    parentStack[parentStack.length - 1].appendChild(node);
    
    // Update hierarchy state after adding the node
    const stateResult = updateHierarchyState(node, parentStack, currentLevel, level);
    parentStack = stateResult.parentStack;
    currentLevel = stateResult.currentLevel;
  }
  
  Streamlit.setFrameHeight(height);
}

/**
 * Initialize the component and set up message handler
 */
function initComponent() {
  window.addEventListener("message", (event) => {
    const data = event.data.args;
    if (data) {
      // Restore the collapsed state if available
      if (data.collapsedState) {
        collapsedNodes = new Set(data.collapsedState);
      }
      renderComponent(data);
    }
  });

  Streamlit.setComponentReady();
}

// Run initialization
initComponent();

// Export for testing
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    renderComponent,
    createListNode,
    attachClickHandler,
    updateParentStack,
    updateHierarchyState,
    initComponent
  };
}
