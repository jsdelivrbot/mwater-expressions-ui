var BuildEnumsetExprComponent, ExprUtils, PropTypes, R, React, RemovableComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

RemovableComponent = require('./RemovableComponent');

module.exports = BuildEnumsetExprComponent = (function(superClass) {
  extend(BuildEnumsetExprComponent, superClass);

  function BuildEnumsetExprComponent() {
    this.handleValueChange = bind(this.handleValueChange, this);
    return BuildEnumsetExprComponent.__super__.constructor.apply(this, arguments);
  }

  BuildEnumsetExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    value: PropTypes.object,
    enumValues: PropTypes.array,
    onChange: PropTypes.func
  };

  BuildEnumsetExprComponent.contextTypes = {
    locale: PropTypes.string
  };

  BuildEnumsetExprComponent.prototype.handleValueChange = function(id, value) {
    var values;
    values = _.clone(this.props.value.values);
    values[id] = value;
    return this.props.onChange(_.extend({}, this.props.value, {
      values: values
    }));
  };

  BuildEnumsetExprComponent.prototype.renderValues = function() {
    var ExprComponent, exprUtils;
    ExprComponent = require('./ExprComponent');
    exprUtils = new ExprUtils(this.props.schema);
    return R('table', {
      className: "table table-bordered"
    }, R('thead', null, R('tr', null, R('th', {
      key: "name"
    }, "Choice"), R('th', {
      key: "include"
    }, "Include if"))), R('tbody', null, _.map(this.props.enumValues, (function(_this) {
      return function(enumValue) {
        return R('tr', {
          key: enumValue.id
        }, R('td', {
          key: "name"
        }, exprUtils.localizeString(enumValue.name, _this.context.locale)), R('td', {
          key: "value",
          style: {
            maxWidth: "30em"
          }
        }, R(ExprComponent, {
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          table: _this.props.value.table,
          value: _this.props.value.values[enumValue.id],
          onChange: _this.handleValueChange.bind(null, enumValue.id),
          types: ['boolean']
        })));
      };
    })(this))));
  };

  BuildEnumsetExprComponent.prototype.render = function() {
    return R(RemovableComponent, {
      onRemove: this.props.onChange.bind(null, null)
    }, this.props.enumValues ? this.renderValues() : R('i', null, "Cannot display build enumset without known values"));
  };

  return BuildEnumsetExprComponent;

})(React.Component);
