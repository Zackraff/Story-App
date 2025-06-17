export default class Router {
  static navigateTo(route) {
    window.location.hash = route;
  }
}
