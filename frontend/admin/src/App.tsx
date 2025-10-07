import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import StudentsManagement from "./pages/Tables/StudentsManagement";
import MentorsManagement from "./pages/Tables/MentorsManagement";
import CreateReadingQuestion from "./pages/Questions/CreateReadingQuestion";
import CreateListeningQuestion from "./pages/Questions/CreateListeningQuestion";
import CreateSpeakingQuestion from "./pages/Questions/CreateSpeakingQuestion";
import CreateWritingQuestion from "./pages/Questions/CreateWritingQuestion";
import CreateExamSet from "./pages/ExamSets/CreateExamSet";
import ViewExamSets from "./pages/ExamSets/ViewExamSets";
import ExamSetDetail from "./pages/ExamSets/ExamSetDetail";
import EditExamSet from "./pages/ExamSets/EditExamSet";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserManagementPage from "./pages/UserManagementPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="profile" element={<UserProfiles />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="blank" element={<Blank />} />
            <Route path="form-elements" element={<FormElements />} />
            <Route path="questions/create-reading" element={<CreateReadingQuestion />} />
            <Route path="questions/create-listening" element={<CreateListeningQuestion />} />
            <Route path="questions/create-speaking" element={<CreateSpeakingQuestion />} />
            <Route path="questions/create-writing" element={<CreateWritingQuestion />} />
            <Route path="questions/edit-reading/:id" element={<CreateReadingQuestion />} />
            <Route path="questions/edit-listening/:id" element={<CreateListeningQuestion />} />
            <Route path="questions/edit-speaking/:id" element={<CreateSpeakingQuestion />} />
            <Route path="questions/edit-writing/:id" element={<CreateWritingQuestion />} />
            <Route path="create-exam-set" element={<CreateExamSet />} />
            <Route path="exam-sets/create" element={<CreateExamSet />} />
            <Route path="exam-sets/view" element={<ViewExamSets />} />
            <Route path="exam-sets/:type/:id" element={<ExamSetDetail />} />
            <Route path="exam-sets/edit/:type/:id" element={<EditExamSet />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="mentors" element={<MentorsManagement />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
