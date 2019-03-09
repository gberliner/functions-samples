"use strict";

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _reactRouterDom = require("react-router-dom");

var _App = _interopRequireDefault(require("./App"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom.default.render(_react.default.createElement(_reactRouterDom.BrowserRouter, null, _react.default.createElement(_App.default, {
  state: window.__initialState
})), document.getElementById('root'));
//# sourceMappingURL=ClientApp.js.map