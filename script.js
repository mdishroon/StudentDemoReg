document.getElementById("registrationForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const studentId = form.studentId.value.trim();
    const number = form.number.value.trim();
    const course = form.course.value;
    const demoDate = form.demoDate.value;
    const demoTime = form.demoTime.value;
    const projectDescription = form.projectDescription.value.trim();
    const requirements = form.requirements.value.trim();
    const confirmation = form.confirmation.checked;

    if (!confirmation) {
        alert("You must confirm that you're prepared to give your demo.");
        return;
    }

    const demo_slot = `${demoDate} ${demoTime}`;

    const payload = {
        fullName,
        email,
        studentId,
        number,
        course,
        demo_slot,
        projectDescription,
        requirements
    };

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("registrationForm").classList.add("hidden");
            document.getElementById("confirmationMessage").classList.remove("hidden");
        } else {
            alert("Error: " + result.error);
        }
    } catch (err) {
        console.error("Error submitting form:", err);
        alert("Submission failed. Try again later.");
    }
});

document.getElementById("newRegistrationBtn")?.addEventListener("click", () => {
    document.getElementById("confirmationMessage").classList.add("hidden");
    document.getElementById("registrationForm").classList.remove("hidden");
});
