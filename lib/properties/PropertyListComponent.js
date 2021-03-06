var ActionCancelModalComponent, LocalizedStringComponent, NestedListClipboardEnhancement, PropTypes, PropertyComponent, PropertyEditorComponent, PropertyListComponent, R, React, ReorderableListComponent, SectionEditorComponent, _, flattenProperties, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

uuid = require('uuid');

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

LocalizedStringComponent = require('../LocalizedStringComponent');

PropertyEditorComponent = require('./PropertyEditorComponent');

SectionEditorComponent = require('./SectionEditorComponent');

NestedListClipboardEnhancement = require('./NestedListClipboardEnhancement');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

PropertyListComponent = (function(superClass) {
  extend(PropertyListComponent, superClass);

  PropertyListComponent.propTypes = {
    properties: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object,
    dataSource: PropTypes.object,
    table: PropTypes.string,
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    propertyIdGenerator: PropTypes.func,
    allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    features: PropTypes.array,
    createRoleDisplayElem: PropTypes.func,
    createRoleEditElem: PropTypes.func,
    onCut: PropTypes.func,
    onCopy: PropTypes.func,
    onPaste: PropTypes.func,
    onPasteInto: PropTypes.func,
    listId: PropTypes.string
  };

  PropertyListComponent.contextTypes = {
    clipboard: PropTypes.object
  };

  function PropertyListComponent(props) {
    this.renderProperty = bind(this.renderProperty, this);
    this.handleNewSection = bind(this.handleNewSection, this);
    this.handleNewProperty = bind(this.handleNewProperty, this);
    this.handleDelete = bind(this.handleDelete, this);
    this.handleChange = bind(this.handleChange, this);
    PropertyListComponent.__super__.constructor.call(this, props);
    this.state = {
      addingItem: null
    };
  }

  PropertyListComponent.prototype.handleChange = function(index, property) {
    var value;
    value = this.props.properties.slice();
    value[index] = property;
    return this.props.onChange(value);
  };

  PropertyListComponent.prototype.handleDelete = function(index) {
    var value;
    value = this.props.properties.slice();
    _.pullAt(value, index);
    return this.props.onChange(value);
  };

  PropertyListComponent.prototype.handleNewProperty = function() {
    var property;
    property = {
      type: "text"
    };
    if (this.props.propertyIdGenerator) {
      property["id"] = this.props.propertyIdGenerator();
    }
    return this.setState({
      addingItem: property
    });
  };

  PropertyListComponent.prototype.handleNewSection = function() {
    var section;
    section = {
      type: "section",
      contents: []
    };
    return this.setState({
      addingItem: section
    });
  };

  PropertyListComponent.prototype.renderControls = function(allPropertyIds) {
    return R('div', {
      className: "btn-group pl-controls"
    }, this.renderAddingModal(allPropertyIds), R('button', {
      key: "default_add",
      type: "button",
      className: "btn btn-xs btn-default dropdown-toggle",
      "data-toggle": "dropdown"
    }, R('span', {
      className: "glyphicon glyphicon-plus"
    }), " ", "Add", " ", R('span', {
      className: "caret"
    })), R('ul', {
      className: "dropdown-menu text-left",
      role: "menu"
    }, R('li', {
      key: "property"
    }, R('a', {
      onClick: this.handleNewProperty
    }, "Property")), _.includes(this.props.features, "section") ? R('li', {
      key: "section"
    }, R('a', {
      onClick: this.handleNewSection
    }, "Section")) : void 0));
  };

  PropertyListComponent.prototype.renderAddingModal = function(allPropertyIds) {
    if (!this.state.addingItem) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      size: "large",
      title: this.state.addingItem.type === "section" ? "Add a section" : "Add a property",
      actionLabel: "Save",
      onAction: (function(_this) {
        return function() {
          var ref, value;
          if (_this.state.addingItem) {
            if (ref = _this.state.addingItem.id, indexOf.call(allPropertyIds, ref) >= 0) {
              return alert("Duplicate ids not allowed");
            }
            value = _this.props.properties.slice();
            value.push(_this.state.addingItem);
            _this.props.onChange(value);
            return _this.setState({
              addingItem: null
            });
          }
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            addingItem: null
          });
        };
      })(this)
    }, this.state.addingItem.type === "section" ? R(SectionEditorComponent, {
      property: this.state.addingItem,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            addingItem: updatedProperty
          });
        };
      })(this),
      features: this.props.features
    }) : R(PropertyEditorComponent, {
      property: this.state.addingItem,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      tableIds: this.props.tableIds,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            addingItem: updatedProperty
          });
        };
      })(this),
      features: this.props.features,
      createRoleEditElem: this.props.createRoleEditElem,
      forbiddenPropertyIds: allPropertyIds
    }));
  };

  PropertyListComponent.prototype.renderProperty = function(allPropertyIds, item, index, connectDragSource, connectDragPreview, connectDropTarget) {
    var elem;
    elem = R('div', {
      key: index
    }, R(PropertyComponent, {
      property: item,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      tableIds: this.props.tableIds,
      features: this.props.features,
      onChange: this.handleChange.bind(null, index),
      onDelete: this.handleDelete.bind(null, index),
      onCut: this.props.onCut,
      onCopy: this.props.onCopy,
      onPaste: this.props.onPaste,
      onPasteInto: this.props.onPasteInto,
      createRoleEditElem: this.props.createRoleEditElem,
      createRoleDisplayElem: this.props.createRoleDisplayElem,
      listId: this.props.listId,
      allPropertyIds: allPropertyIds
    }));
    return connectDragPreview(connectDropTarget(connectDragSource(elem)));
  };

  PropertyListComponent.prototype.render = function() {
    var allPropertyIds;
    allPropertyIds = _.pluck(flattenProperties(this.props.properties), "id");
    return R('div', {
      className: 'pl-editor-container'
    }, R(ReorderableListComponent, {
      items: this.props.properties,
      onReorder: (function(_this) {
        return function(list) {
          return _this.props.onChange(list);
        };
      })(this),
      renderItem: this.renderProperty.bind(this, allPropertyIds),
      getItemId: (function(_this) {
        return function(item) {
          return item.id;
        };
      })(this),
      element: R('div', {
        className: 'pl-container'
      })
    }), this.renderControls(allPropertyIds));
  };

  return PropertyListComponent;

})(React.Component);

PropertyComponent = (function(superClass) {
  extend(PropertyComponent, superClass);

  PropertyComponent.propTypes = {
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object,
    dataSource: PropTypes.object,
    table: PropTypes.string,
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    features: PropTypes.array,
    createRoleDisplayElem: PropTypes.func,
    createRoleEditElem: PropTypes.func,
    onCut: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPasteInto: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    listId: PropTypes.string,
    allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired)
  };

  PropertyComponent.iconMap = {
    text: "fa fa-font",
    number: "fa fa-calculator",
    "enum": "fa fa-check-circle-o",
    enumset: "fa fa-check-square-o",
    date: "fa fa-calendar-check-o",
    datetime: "fa fa-calendar-check-o",
    image: "fa fa-file-image-o",
    imagelist: "fa fa-file-image-o",
    section: "fa fa-folder",
    geometry: "fa fa-map-marker",
    boolean: "fa fa-toggle-on",
    id: "fa fa-arrow-right",
    join: "fa fa-link"
  };

  PropertyComponent.contextTypes = {
    clipboard: PropTypes.object
  };

  function PropertyComponent(props) {
    this.renderEnumValues = bind(this.renderEnumValues, this);
    this.handleEdit = bind(this.handleEdit, this);
    PropertyComponent.__super__.constructor.call(this, props);
    this.state = {
      editing: false,
      editorProperty: null
    };
  }

  PropertyComponent.prototype.handleEdit = function() {
    return this.setState({
      editing: true,
      editorProperty: this.props.property
    });
  };

  PropertyComponent.prototype.renderControls = function() {
    return R('div', {
      className: "pl-item-controls"
    }, R('a', {
      className: "pl-item-control",
      onClick: this.handleEdit
    }, "Edit"), R('a', {
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onCopy(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Copy"), R('a', {
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onCut(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Cut"), this.context.clipboard ? R('a', {
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onPaste(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Paste") : void 0, this.context.clipboard && this.props.property.type === "section" ? R('a', {
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onPasteInto(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Paste Into") : void 0, R('a', {
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onDelete();
        };
      })(this))
    }, "Delete"));
  };

  PropertyComponent.prototype.renderEnumValues = function(values) {
    var names;
    names = _.map(values, function(value) {
      return value.name[value._base || "en"];
    });
    return R('span', null, "" + (names.join(" / ")));
  };

  PropertyComponent.prototype.renderTable = function(table) {
    var ref;
    return R(LocalizedStringComponent, {
      value: (ref = this.props.schema.getTable(table)) != null ? ref.name : void 0
    });
  };

  PropertyComponent.prototype.render = function() {
    var classNames, ref;
    classNames = ["pl-property"];
    if (this.props.property.deprecated) {
      classNames.push("deprecated");
    }
    return R('div', {
      className: (classNames.join(" ")) + " pl-item-type-" + this.props.property.type
    }, this.state.editing ? R(ActionCancelModalComponent, {
      size: "large",
      title: this.state.editorProperty.type === "section" ? "Edit section" : "Edit property",
      actionLabel: "Save",
      onAction: (function(_this) {
        return function() {
          var ref;
          if (_this.state.editorProperty) {
            if (_this.state.editorProperty.id !== _this.props.property.id && (ref = _this.state.editorProperty.id, indexOf.call(_this.props.allPropertyIds, ref) >= 0)) {
              return alert("Duplicate ids not allowed");
            }
            _this.props.onChange(_this.state.editorProperty);
          }
          return _this.setState({
            editing: false,
            editorProperty: null
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            editing: false,
            editorProperty: null
          });
        };
      })(this)
    }, this.props.property.type === "section" ? R(SectionEditorComponent, {
      property: this.state.editorProperty,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            editorProperty: updatedProperty
          });
        };
      })(this),
      features: this.props.features
    }) : R(PropertyEditorComponent, {
      property: this.state.editorProperty,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      tableIds: this.props.tableIds,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            editorProperty: updatedProperty
          });
        };
      })(this),
      features: this.props.features,
      createRoleEditElem: this.props.createRoleEditElem,
      forbiddenPropertyIds: _.without(this.props.allPropertyIds, this.props.property.id)
    })) : void 0, this.renderControls(), this.props.property.deprecated ? R('div', {
      className: "pl-item-deprecated-overlay"
    }, "") : void 0, R('div', {
      className: "pl-item",
      onDoubleClick: this.handleEdit
    }, R('div', {
      className: "pl-item-detail"
    }, R('span', {
      className: "pl-item-detail-indicator"
    }, R('i', {
      className: PropertyComponent.iconMap[this.props.property.type] + " fa-fw"
    })), R('div', null, R('div', {
      className: "pl-item-detail-name"
    }, _.includes(this.props.features, "idField") && this.props.property.id ? R('small', null, "[" + this.props.property.id + "] ") : void 0, R(LocalizedStringComponent, {
      value: this.props.property.name
    }), this.props.property.expr ? R('span', {
      className: "text-muted"
    }, " ", R('span', {
      className: "fa fa-calculator"
    })) : void 0), this.props.property.desc ? R('div', {
      className: "pl-item-detail-description"
    }, R(LocalizedStringComponent, {
      value: this.props.property.desc
    })) : void 0, this.props.property.sql ? R('div', {
      className: "pl-item-detail-sql text-muted"
    }, this.props.property.sql) : void 0, ((ref = this.props.property.type) === "enum" || ref === "enumset") && this.props.property.enumValues.length > 0 ? R('div', {
      className: "pl-item-detail-enum text-muted"
    }, this.renderEnumValues(this.props.property.enumValues)) : void 0, _.includes(this.props.features, "table") && this.props.property.table ? R('div', {
      className: "pl-item-detail-table text-muted"
    }, this.renderTable(this.props.property.table)) : void 0, this.props.property.roles && this.props.createRoleDisplayElem ? this.props.createRoleDisplayElem(this.props.property.roles) : void 0))), this.props.property.type === "section" ? R('div', {
      className: "pl-item-section"
    }, R(PropertyListComponent, {
      properties: this.props.property.contents || [],
      features: this.props.features,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      tableIds: this.props.tableIds,
      createRoleEditElem: this.props.createRoleEditElem,
      createRoleDisplayElem: this.props.createRoleDisplayElem,
      onCut: this.props.onCut,
      onCopy: this.props.onCopy,
      onPaste: this.props.onPaste,
      onPasteInto: this.props.onPasteInto,
      listId: this.props.property.id,
      onChange: (function(_this) {
        return function(list) {
          var newProperty;
          newProperty = _.cloneDeep(_this.props.property);
          newProperty.contents = list;
          return _this.props.onChange(newProperty);
        };
      })(this),
      allPropertyIds: this.props.allPropertyIds
    })) : void 0);
  };

  return PropertyComponent;

})(React.Component);

module.exports = NestedListClipboardEnhancement(PropertyListComponent);

flattenProperties = function(properties) {
  var i, len, prop, props;
  props = [];
  for (i = 0, len = properties.length; i < len; i++) {
    prop = properties[i];
    if (prop.contents) {
      props = props.concat(flattenProperties(prop.contents));
    } else {
      props.push(prop);
    }
  }
  return props;
};
