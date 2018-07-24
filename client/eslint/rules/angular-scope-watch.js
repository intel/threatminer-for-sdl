
module.exports = function(context) {

  'use strict';

  return {
    'CallExpression': function(node) {
      if(node.callee.type === 'MemberExpression' && node.callee.object.name === '$scope') {
        if (node.callee.property.name === '$watch' || node.callee.property.name === '$watchCollection' || node.callee.property.name === '$watchGroup') {
          context.report(node, 'Discourage $watch, $watchGroup & $watchCollection usage', {});
        }
      }
    }
  };

};
