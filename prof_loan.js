document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "php/prof_loan.php"; // Adjust path if needed

    /*** DATE & TIME DISPLAY ***/
    function updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById("current_datetime").textContent = `${dateStr} | ${timeStr}`;
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

    /*** LOGO DISPLAY ***/
    const logoContainer = document.getElementById("logo_container");
    if (logoContainer) {
        const logoImg = document.createElement("img");
        logoImg.src = "images/logo.png"; // Change filename if different
        logoImg.alt = "Company Logo";
        logoImg.style.height = "80px";
        logoImg.style.display = "block";
        logoImg.style.marginBottom = "10px";
        logoContainer.appendChild(logoImg);
    }

    /*** FORM ELEMENTS ***/
    const fnameField = document.getElementById("first_name");
    const mnameField = document.getElementById("middle_name");
    const lnameField = document.getElementById("last_name");
    const birthdateField = document.getElementById("birthdate");
    const addressField = document.getElementById("address");
    const empNumField = document.getElementById("employee_number");
    const stationField = document.getElementById("station");
    const contactField = document.getElementById("contact_number");
    const validIdField = document.getElementById("valid_id");
    const ewalletVendorField = document.getElementById("ewallet_vendor");
    const ewalletAccField = document.getElementById("ewallet_account");

    const loanCodeField = document.getElementById("loan_code");
    const statusField = document.getElementById("status");
    const loanEligField = document.getElementById("loan_elig");

    const loanAmountDropdown = document.getElementById("loan_amount");
    const termsDropdown = document.getElementById("terms");
    const proceedsDropdown = document.getElementById("proceeds_mode");
    const netProceedsField = document.getElementById("net_proceeds");
    const repayAmountField = document.getElementById("amount_to_repay");
    const computationField = document.getElementById("loan_computation");

    const applyBtn = document.getElementById("apply_button");

    /*** FETCH PROFILE & LOAN INFO ***/
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const p = data.profile;
                const l = data.loan || {};

                // Fill profile
                fnameField.value = p.First_Name || "";
                mnameField.value = p.Middle_Name || "";
                lnameField.value = p.Last_Name || "";
                birthdateField.value = p.Birthdate || "";
                addressField.value = p.Address || "";
                empNumField.value = p.Employee_Number || "";
                stationField.value = p.Station || "";
                contactField.value = p.Contact_Number || "";
                validIdField.value = p.Valid_ID || "";
                ewalletVendorField.value = p.eWallet_Vendor || "";
                ewalletAccField.value = p.eWallet_Account || "";

                // Loan
                loanCodeField.value = l.Loan_Code_Applied || "A1";
                statusField.value = l.Status || "";
                loanEligField.value = l.Loan_Elig || (l.Loan_Code_Applied ? "Yes" : "Yes-A1");

                populateLoanAmountOptions(loanEligField.value);

                // ** ID Previews **
                const idFrontPreview = document.getElementById("id_front_preview");
                const idBackPreview = document.getElementById("id_back_preview");

                if (p.ID_Front) {
                    idFrontPreview.src = `uploads/${p.ID_Front}`;
                    idFrontPreview.alt = "Front ID";
                }
                if (p.ID_Back) {
                    idBackPreview.src = `uploads/${p.ID_Back}`;
                    idBackPreview.alt = "Back ID";
                }
            }
        })
        .catch(err => console.error("Error fetching profile:", err));

    /*** Populate Loan Amount Options ***/
    function populateLoanAmountOptions(elig) {
        loanAmountDropdown.innerHTML = "";
        if (elig.startsWith("Yes-A1")) {
            loanAmountDropdown.innerHTML += `<option value="2000">₱2,000.00</option>`;
        }
        if (elig.startsWith("Yes-B1")) {
            loanAmountDropdown.innerHTML += `<option value="2000">₱2,000.00</option>`;
            loanAmountDropdown.innerHTML += `<option value="3000">₱3,000.00</option>`;
        }
        if (elig.startsWith("Yes-B2")) {
            loanAmountDropdown.innerHTML += `<option value="2000">₱2,000.00</option>`;
            loanAmountDropdown.innerHTML += `<option value="3000">₱3,000.00</option>`;
            loanAmountDropdown.innerHTML += `<option value="5000">₱5,000.00</option>`;
        }
        if (elig.startsWith("Yes-B3")) {
            loanAmountDropdown.innerHTML += `<option value="2000">₱2,000.00</option>`;
            loanAmountDropdown.innerHTML += `<option value="3000">₱3,000.00</option>`;
            loanAmountDropdown.innerHTML += `<option value="5000">₱5,000.00</option>`;
            loanAmountDropdown.innerHTML += `<option value="10000">₱10,000.00</option>`;
        }
    }

    /*** Loan Computation ***/
    function computeLoanDetails() {
        const amount = parseFloat(loanAmountDropdown.value) || 0;
        const termsText = termsDropdown.options[termsDropdown.selectedIndex].text;
        const interestMatch = termsText.match(/(\d+)%/);
        const interestRate = interestMatch ? parseInt(interestMatch[1]) : 0;
        const proceedsMode = proceedsDropdown.value;

        let netProceeds = 0;
        let repayAmount = 0;

        if (proceedsMode === "Option2") {
            netProceeds = amount - (amount * (interestRate / 100));
            repayAmount = amount;
        } else if (proceedsMode === "Option3") {
            netProceeds = amount;
            repayAmount = amount + (amount * (interestRate / 100));
        }

        netProceedsField.value = "₱" + netProceeds.toFixed(2);
        repayAmountField.value = "₱" + repayAmount.toFixed(2);

        computationField.value =
            `Loan Amount: ₱${amount.toFixed(2)}\n` +
            `Terms: ${termsText}\n` +
            `Interest: ${interestRate}%\n` +
            `Proceeds Mode: ${proceedsMode}\n` +
            `Proceeds: ₱${netProceeds.toFixed(2)}\n` +
            `Repayment Date: ${termsText.split(",")[0]}\n` +
            `Repayment Amount: ₱${repayAmount.toFixed(2)}`;
    }

    loanAmountDropdown.addEventListener("change", computeLoanDetails);
    termsDropdown.addEventListener("change", computeLoanDetails);
    proceedsDropdown.addEventListener("change", computeLoanDetails);

    /*** Apply Loan Button ***/
    applyBtn.addEventListener("click", function () {
        if (!confirm("By clicking Apply button, you agree to the Loan Policy and Terms and Conditions of 2KMicL.")) {
            window.location.href = "index.html";
            return;
        }

        const formData = new FormData();
        formData.append("First_Name", fnameField.value);
        formData.append("Middle_Name", mnameField.value);
        formData.append("Last_Name", lnameField.value);
        formData.append("Loan_Code", loanCodeField.value);
        formData.append("Loan_Amount", loanAmountDropdown.value);
        formData.append("Terms", termsDropdown.options[termsDropdown.selectedIndex].text);
        formData.append("Interest_Rate", termsDropdown.value);
        formData.append("Proceeds_Mode", proceedsDropdown.value);
        formData.append("Net_Proceeds", netProceedsField.value);
        formData.append("Amount_To_Repay", repayAmountField.value);
        formData.append("Repayment_Date", termsDropdown.options[termsDropdown.selectedIndex].text.split(",")[0]);

        fetch(apiUrl, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.status === "success") {
                    window.location.href = "index.html";
                }
            })
            .catch(err => console.error("Error submitting loan:", err));
    });
});

