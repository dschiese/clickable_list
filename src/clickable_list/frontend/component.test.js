/**
 * Tests for clickable-list component
 */

// Mock the Streamlit object
global.Streamlit = {
    setComponentValue: jest.fn(),
    setFrameHeight: jest.fn(),
    setComponentReady: jest.fn()
  };
  
  // Import the component module
  const {
    createListNode,
    attachClickHandler,
    updateParentStack,
    updateHierarchyState,
    renderComponent
  } = require('./component');
  
  // Setup DOM testing environment
  beforeEach(() => {
    // Setup a DOM element as a render target
    document.body.innerHTML = '<div id="root"></div>';
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  // createListNode tests
  describe('createListNode', () => {
    test('creates a leaf node (li) when not followed by higher level item', () => {
      const item = { id: 'item1', name: 'Test Item', level: 0 };
      const options = [item];
      
      const node = createListNode(item, options, 0, 10);
      const rootNode = document.getElementById('root');

      expect(node.tagName).toBe('LI');
      expect(node.id).toBe('item1');
      expect(node.innerHTML).toBe('Test Item');
    });
  
    test('creates a parent node (ul) when followed by higher level item', () => {
      const item = { id: 'parent', name: 'Parent', level: 0 };
      const childItem = { id: 'child', name: 'Child', level: 1 };
      const options = [item, childItem];
      
      const node = createListNode(item, options, 0, 10);
      const rootNode = document.getElementById('root');
      
      expect(node.tagName).toBe('UL');
      expect(node.id).toBe('parent');
    });
  
    test('applies indentation for nested items', () => {
      const item = { id: 'nested', name: 'Nested Item', level: 2 };
      const options = [item];
      const indent = 15;
      
      const node = createListNode(item, options, 0, indent, null);
      
      expect(node.style.marginLeft).toBe('15px');
    });
  
    test('does not apply indentation for level 0 items', () => {
      const item = { id: 'root', name: 'Root Item', level: 0 };
      const options = [item];
      
      const node = createListNode(item, options, 0, 10, null);
      
      expect(node.style.marginLeft).toBe('');
    });
  
    test('applies custom CSS style', () => {
      const item = { id: 'styled', name: 'Styled Item', level: 0 };
      const options = [item];
      const style = 'color: red; font-weight: bold;';
      
      const node = createListNode(item, options, 0, 10, style);
      
      expect(node.style.color).toBe('red');
      expect(node.style.fontWeight).toBe('bold');
    });
  });
  
  describe('attachClickHandler', () => {
    test('attaches click handler that calls Streamlit.setComponentValue', () => {
      const node = document.createElement('li');
      const item = { id: 'test', name: 'Test' };
      
      attachClickHandler(node, item);
      
      // Simulate click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      
      // Mock stopPropagation method
      clickEvent.stopPropagation = jest.fn();
      
      node.dispatchEvent(clickEvent);
      
      expect(clickEvent.stopPropagation).toHaveBeenCalled();
      expect(Streamlit.setComponentValue).toHaveBeenCalledWith(item);
    });
  });
  
  describe('updateParentStack', () => {
    test('returns same stack and level when level does not change', () => {
      const div = document.createElement('div');
      const parentStack = [div];
      const currentLevel = 1;
      
      const result = updateParentStack(parentStack, currentLevel, 1);
      
      expect(result.parentStack).toEqual(parentStack);
      expect(result.currentLevel).toBe(1);
    });
  
    test('adds last child to stack when going deeper', () => {
      const root = document.createElement('div');
      const child = document.createElement('ul');
      root.appendChild(child);
      
      const parentStack = [root];
      const currentLevel = 0;
      
      const result = updateParentStack(parentStack, currentLevel, 1);
      
      expect(result.parentStack).toHaveLength(2);
      expect(result.parentStack[0]).toBe(root);
      expect(result.parentStack[1]).toBe(child);
      expect(result.currentLevel).toBe(1);
    });
  
    test('pops items from stack when going to lower level', () => {
      const root = document.createElement('div');
      const level1 = document.createElement('ul');
      const level2 = document.createElement('ul');
      root.appendChild(level1);
      level1.appendChild(level2);
      
      const parentStack = [root, level1, level2];
      const currentLevel = 2;
      
      const result = updateParentStack(parentStack, currentLevel, 0);
      
      expect(result.parentStack).toHaveLength(1);
      expect(result.parentStack[0]).toBe(root);
      expect(result.currentLevel).toBe(0);
    });
  });
  
  describe('updateHierarchyState', () => {
    test('adds node to stack and increments level when node is UL', () => {
      const root = document.createElement('div');
      const ulNode = document.createElement('ul');
      const parentStack = [root];
      const currentLevel = 0;
      const itemLevel = 1;
      
      const result = updateHierarchyState(ulNode, parentStack, currentLevel, itemLevel);
      
      expect(result.parentStack).toHaveLength(2);
      expect(result.parentStack[1]).toBe(ulNode);
      expect(result.currentLevel).toBe(2); // itemLevel + 1
    });
  
    test('keeps stack same and sets level to itemLevel when node is not UL', () => {
      const root = document.createElement('div');
      const liNode = document.createElement('li');
      const parentStack = [root];
      const currentLevel = 1;
      const itemLevel = 2;
      
      const result = updateHierarchyState(liNode, parentStack, currentLevel, itemLevel);
      
      expect(result.parentStack).toHaveLength(1);
      expect(result.parentStack[0]).toBe(root);
      expect(result.currentLevel).toBe(2);
    });
  });
  
  describe('renderComponent', () => {
    test('does nothing when data or options are missing', () => {
      const rootElement = document.getElementById('root');
      
      renderComponent(null);
      expect(rootElement.innerHTML).toBe('');
      
      renderComponent({});
      expect(rootElement.innerHTML).toBe('');
    });
  
    test('renders a flat list correctly', () => {
      const data = {
        options: [
          { id: 'item1', name: 'Item 1', level: 0 },
          { id: 'item2', name: 'Item 2', level: 0 }
        ],
        indent: 10
      };
      
      renderComponent(data);
      
      const rootElement = document.getElementById('root');
      expect(rootElement.children.length).toBe(2);
      expect(rootElement.children[0].id).toBe('item1');
      expect(rootElement.children[1].id).toBe('item2');
      expect(Streamlit.setFrameHeight).toHaveBeenCalledWith(70); // 2 items * 35px
    });
  
    test('renders nested hierarchy correctly', () => {
      const data = {
        options: [
          { id: 'parent', name: 'Parent', level: 0 },
          { id: 'child1', name: 'Child 1', level: 1 },
          { id: 'child2', name: 'Child 2', level: 1 },
          { id: 'grandchild', name: 'Grandchild', level: 2 }
        ],
        indent: 15,
        style: 'color: blue;'
      };
      
      renderComponent(data);
      
      const rootElement = document.getElementById('root');
      
      // Check parent structure
      expect(rootElement.children.length).toBe(1);
      const parent = rootElement.children[0];
      expect(parent.id).toBe('parent');
      expect(parent.tagName).toBe('UL');
      
      // Check that children have the right parent
      expect(parent.children.length).toBe(2);
      expect(parent.children[0].id).toBe('child1');
      expect(parent.children[1].id).toBe('child2');
      expect(parent.children[1].tagName).toBe('UL');
      
      // Check grandchild
      expect(parent.children[1].children[0].id).toBe('grandchild');
      expect(parent.children[1].children[0].style.marginLeft).toBe('15px');
      expect(parent.children[1].children[0].style.color).toBe('blue');
      
      // Check frame height calculation
      expect(Streamlit.setFrameHeight).toHaveBeenCalledWith(140); // 4 items * 35px
    });
  });