
import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";

import AuthPage from "@/pages/auth";
import ManualEntryPage from "@/pages/app/manual-entry";
import SmartDumpPage from "@/pages/app/smart-dump";
import ExtractionPage from "@/pages/app/extraction";
import ReportsPage from "@/pages/app/reports"; // Import the new Reports page

import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <> 
      <Switch>
        <Route path="/"><Redirect to="/app/manual-entry" /></Route>
        <Route path="/auth"><AuthPage /></Route>
        
        {/* App Routes */}
        <Route path="/app/manual-entry"><ManualEntryPage /></Route>
        <Route path="/app/smart-dump"><SmartDumpPage /></Route>
        <Route path="/app/extraction"><ExtractionPage /></Route>
        <Route path="/app/reports"><ReportsPage /></Route> {/* Add the new Reports route */}

        <Route path="/:rest*"><NotFound /></Route>
      </Switch>
      <Toaster />
    </>
  );
}
