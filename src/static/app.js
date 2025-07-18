document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear select options before repopulating
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Set basic info using innerHTML
        const activityTitle = document.createElement("h4");
        activityTitle.textContent = name;
        activityCard.appendChild(activityTitle);

        const descriptionParagraph = document.createElement("p");
        descriptionParagraph.textContent = details.description;
        activityCard.appendChild(descriptionParagraph);

        const scheduleParagraph = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleParagraph.appendChild(scheduleStrong);
        scheduleParagraph.appendChild(document.createTextNode(` ${details.schedule}`));
        activityCard.appendChild(scheduleParagraph);

        const availabilityParagraph = document.createElement("p");
        const availabilityStrong = document.createElement("strong");
        availabilityStrong.textContent = "Availability:";
        availabilityParagraph.appendChild(availabilityStrong);
        availabilityParagraph.appendChild(document.createTextNode(` ${spotsLeft} spots left`));
        activityCard.appendChild(availabilityParagraph);
        // Create participants section using DOM methods
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        const participantsTitle = document.createElement("strong");
        participantsTitle.textContent = "Participants:";
        participantsSection.appendChild(participantsTitle);

        if (details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          details.participants.forEach(email => {
            const li = document.createElement("li");
            li.textContent = email;
            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          const none = document.createElement("p");
          none.className = "participants-none";
          none.textContent = "No participants yet.";
          participantsSection.appendChild(none);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
