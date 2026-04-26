class Feedback {
  constructor(opportunityId, outcome, lessons, scores) {
    this.opportunityId = opportunityId;
    this.outcome = outcome;
    this.lessons = lessons;
    this.scores = scores;
  }
}

module.exports = Feedback;