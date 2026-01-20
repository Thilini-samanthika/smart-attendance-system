function addResult() {
  let regno = document.getElementById("regno").value;
  let subject = document.getElementById("subject").value;
  let marks = document.getElementById("marks").value;
if (marks === "" || marks < 0 || marks > 100) {
    alert("Invalid Marks");
    return;
  }
  alert("Result Added (Frontend Validation Passed)");
}
