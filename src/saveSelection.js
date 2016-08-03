// Gets the offset of a node within another node. Text nodes are counted a n where n is the length. Entering (or passing) an element is one offset. Exiting is 0.
getNodeOffset = function(start, dest) {
  var offset = 0;

  var node = start;
  var stack = [];

  while (true) {
    if (node === dest) {
      return offset;
    }

    // Go into children
    if (node.firstChild) {
      offset += 1;
      stack.push(node);
      node = node.firstChild;
    }
    // If can go to next sibling
    else if (stack.length > 0 && node.nextSibling) {
      // If text, count length (plus 1)
      if (node.nodeType === 3)
        offset += node.nodeValue.length + 1;
      else
        offset += 1;

      node = node.nextSibling;
    }
    else {
      // If text, count length
      if (node.nodeType === 3)
        offset += node.nodeValue.length + 1;
      else
        offset += 1;

      // No children or siblings, move up stack
      while (true) {
        if (stack.length <= 1)
          return offset;

        var next = stack.pop();

        // Go to sibling
        if (next.nextSibling) {
          node = next.nextSibling;
          break;
        }
      }
    }
  }
}

getNodeAndOffsetAt = function(start, offset) {
  var node = start;
  var stack = [];

  while (true) {
    // If arrived
    if (offset <= 0)
      return { node: node, offset: 0 };

    // If will be within current text node
    if (node.nodeType == 3 && (offset <= node.nodeValue.length))
      return { node: node, offset: Math.min(offset, node.nodeValue.length) };

    // Go into children
    if (node.firstChild) {
      offset -= 1;
      stack.push(node);
      node = node.firstChild;
    }
    // If can go to next sibling
    else if (stack.length > 0 && node.nextSibling) {
      // If text, count length
      if (node.nodeType === 3)
        offset -= node.nodeValue.length + 1;
      else
        offset -= 1;

      node = node.nextSibling;
    }
    else {
      // No children or siblings, move up stack
      while (true) {
        if (stack.length <= 1) {
          // No more options, use current node
          if (node.nodeType == 3)
            return { node: node, offset: Math.min(offset, node.nodeValue.length) };
          else
            return { node: node, offset: 0 };
        }

        var next = stack.pop();

        // Go to sibling
        if (next.nextSibling) {
          // If text, count length
          if (node.nodeType === 3)
            offset -= node.nodeValue.length + 1;
          else
            offset -= 1;
          
          node = next.nextSibling;
          break;
        }
      }
    }
  }
}

exports.save = function(containerEl) {
  // Get range
  var range = window.getSelection().getRangeAt(0);
  return { start: getNodeOffset(containerEl, range.startContainer) + range.startOffset, end: getNodeOffset(containerEl, range.endContainer) + range.endOffset };
}
 
exports.restore = function(containerEl, savedSel) {
  range = document.createRange();

  var startNodeOffset, endNodeOffset;
  startNodeOffset = getNodeAndOffsetAt(containerEl, savedSel.start);
  endNodeOffset = getNodeAndOffsetAt(containerEl, savedSel.end);

  range.setStart(startNodeOffset.node, startNodeOffset.offset);
  range.setEnd(endNodeOffset.node, endNodeOffset.offset);

  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

