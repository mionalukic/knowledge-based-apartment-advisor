package com.ftn.sbnz.service.dto;

import java.util.ArrayList;
import java.util.List;

public class BackwardQueryResponse {

    private String queryName;
    private boolean satisfied;
    private String explanation;
    private List<SubGoalResult> subGoals = new ArrayList<>();

    public BackwardQueryResponse() {}

    public BackwardQueryResponse(String queryName, boolean satisfied, String explanation) {
        this.queryName = queryName;
        this.satisfied = satisfied;
        this.explanation = explanation;
    }

    public String getQueryName() { return queryName; }
    public void setQueryName(String queryName) { this.queryName = queryName; }

    public boolean isSatisfied() { return satisfied; }
    public void setSatisfied(boolean satisfied) { this.satisfied = satisfied; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<SubGoalResult> getSubGoals() { return subGoals; }
    public void setSubGoals(List<SubGoalResult> subGoals) { this.subGoals = subGoals; }

    public void addSubGoal(String name, boolean satisfied, String description) {
        this.subGoals.add(new SubGoalResult(name, satisfied, description));
    }

    public static class SubGoalResult {
        private String goalName;
        private boolean satisfied;
        private String description;

        public SubGoalResult() {}

        public SubGoalResult(String goalName, boolean satisfied, String description) {
            this.goalName = goalName;
            this.satisfied = satisfied;
            this.description = description;
        }

        public String getGoalName() { return goalName; }
        public void setGoalName(String goalName) { this.goalName = goalName; }

        public boolean isSatisfied() { return satisfied; }
        public void setSatisfied(boolean satisfied) { this.satisfied = satisfied; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}