document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("predictionForm");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const button = document.getElementById("submitBtn");
        button.classList.add("btn-loading");
        button.disabled = true;

        const formData = new FormData(form);
        const data = {
            age: parseFloat(formData.get("age")),
            gender: formData.get("gender"),
            cancer_type: formData.get("cancer_type"),
            tumor_size: parseFloat(formData.get("tumor_size")),
            lymph_nodes: parseFloat(formData.get("lymph_nodes")),
            biomarker_1: parseFloat(formData.get("biomarker_1")),
            biomarker_2: parseFloat(formData.get("biomarker_2")),
            current_drug: formData.get("current_drug"),
            symptoms: formData.get("symptoms")
        };

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Prediction failed");
            }

            const result = await response.json();
            showResult(result);
            fetchDoctors(""); // fetch all doctors by default
        } catch (error) {
            console.warn(`API Error: ${error.message}`);
            alert(`Error: ${error.message}`);
        } finally {
            button.classList.remove("btn-loading");
            button.disabled = false;
        }
    });

    document.getElementById("searchDocsBtn").addEventListener("click", () => {
        const city = document.getElementById("citySearch").value;
        fetchDoctors(city);
    });
});

function showResult(data) {
    const resultPanel = document.getElementById("resultPanel");
    const stageText = document.getElementById("stageText");
    const responseText = document.getElementById("responseText");
    const routineText = document.getElementById("routineText");
    
    resultPanel.classList.remove("result-hidden");
    void resultPanel.offsetWidth; 
    resultPanel.classList.add("result-visible");
    
    stageText.textContent = data.predicted_stage;
    responseText.textContent = data.predicted_drug_response;
    
    // Color coding for response
    if(data.predicted_drug_response === "Good") {
        responseText.style.color = "#2dd4bf"; // teal
    } else if (data.predicted_drug_response === "Moderate") {
        responseText.style.color = "#fbbf24"; // yellow/orange
    } else {
        responseText.style.color = "#f87171"; // red
    }
    
    routineText.textContent = data.daily_routine;
}

async function fetchDoctors(city) {
    try {
        let url = "http://localhost:8000/doctors";
        if (city) {
            url += `?city=${encodeURIComponent(city)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        
        const list = document.getElementById("doctorList");
        list.innerHTML = "";
        if (data.doctors.length === 0) {
            list.innerHTML = "<li>No doctors found in this area.</li>";
            return;
        }
        data.doctors.forEach(doc => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${doc.name}</strong> - ${doc.specialty} <br><small>${doc.city}</small>`;
            list.appendChild(li);
        });
    } catch (e) {
        console.error("Error fetching doctors", e);
    }
}
