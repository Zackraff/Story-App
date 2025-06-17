import StoriesPage from "../pages/stories/stories-page";
import DetailStoryPage from "../pages/stories/detail-story-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import MapsPage from "../pages/maps/maps-page";
import SavedStoriesPage from "../pages/saved-stories/saved-stories-page";
import NotificationsPage from "../pages/notifications/notifications-page";

const routes = {
  "/stories": new StoriesPage(),
  "/stories/:id": (id) => new DetailStoryPage(id),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add-story": new AddStoryPage(),
  "/maps": new MapsPage(),
  "/saved-stories": new SavedStoriesPage(),
  "/notifications": new NotificationsPage(),
};

export default routes;
