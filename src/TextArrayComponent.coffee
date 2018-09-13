PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
ReactSelect = require 'react-select'
ExprCompiler = require("mwater-expressions").ExprCompiler

# Displays a combo box that allows selecting multiple text values from an expression
module.exports = class TextArrayComponent extends React.Component
  @propTypes: 
    value: PropTypes.object
    onChange: PropTypes.func.isRequired 
    refExpr: PropTypes.object.isRequired # Expression for the text values to select from
    schema: PropTypes.object.isRequired # Schema of the database
    dataSource: PropTypes.object.isRequired # Data source to use to get values

  focus: ->
    @select.focus()

  handleChange: (val) =>
    value = if val then val.split("\n") else []
    @props.onChange({ type: "literal", valueType: "text[]", value: value })

  escapeRegex: (s) ->
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

  getOptions: (input, cb) =>
    # Create query to get matches ordered by most frequent to least
    exprCompiler = new ExprCompiler(@props.schema)

    # select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
    query = {
      type: "query"
      selects: [
        { type: "select", expr: exprCompiler.compileExpr(expr: @props.refExpr, tableAlias: "main"), alias: "value" }
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
      ]
      from: exprCompiler.compileTable(@props.refExpr.table, "main") 
      where: {
        type: "op"
        op: "~*"
        exprs: [
          exprCompiler.compileExpr(expr: @props.refExpr, tableAlias: "main")
          "^" + @escapeRegex(input)
        ]
      }
      groupBy: [1]
      orderBy: [{ ordinal: 2, direction: "desc" }, { ordinal: 1, direction: "asc" }]
      limit: 50
    }

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        cb(err)
        return 

      # Filter null and blank
      rows = _.filter(rows, (r) -> r.value)

      cb(null, {
        options: _.map(rows, (r) -> { value: r.value, label: r.value })
        complete: false # TODO rows.length < 50 # Complete if didn't hit limit
      })

    return

  render: ->
    value = ""
    if @props.value and @props.value.value.length > 0 
      value = @props.value.value.join("\n")

    R 'div', style: { width: "100%" },
      React.createElement(ReactSelect, { 
        ref: (c) => @select = c
        value: value
        multi: true
        delimiter: "\n"
        placeholder: "Select..."
        asyncOptions: @getOptions
        onChange: @handleChange
      })

