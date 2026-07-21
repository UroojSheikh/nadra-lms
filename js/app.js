/* ==========================================================================
   NADRA Digital Learning — App Logic
   Language toggle, CNIC formatting, form validation, toast, notifications,
   loading states, mobile nav
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLangToggle();
  initCnicFormat();
  initProfileValidation();
  initLoginValidation();
  initSignupValidation();
  initForgotPasswordValidation();
  initNotifDropdown();
  initAvatarUpload();
});

/* ---------- Language toggle (EN / اردو) ---------- */
function applyLang(lang) {
  document.body.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
  document.body.setAttribute("data-lang", lang);

  document.querySelectorAll("[data-en]").forEach((el) => {
    const text = lang === "ur" ? el.getAttribute("data-ur") : el.getAttribute("data-en");
    if (text !== null) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", text);
      } else {
        el.textContent = text;
      }
    }
  });

  document.querySelectorAll(".lang-toggle button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  localStorage.setItem("nadra-lang", lang);
}

function initLangToggle() {
  const buttons = document.querySelectorAll(".lang-toggle button");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  const savedLang = localStorage.getItem("nadra-lang") || "en";
  applyLang(savedLang);
}

/* ---------- CNIC auto-format: 12345-1234567-1 ---------- */
function formatCnic(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  let out = digits;
  if (digits.length > 5) {
    out = digits.slice(0, 5) + "-" + digits.slice(5);
  }
  if (digits.length > 12) {
    out = digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12);
  }
  return out;
}

function initCnicFormat() {
  const cnicField = document.getElementById("cnic");
  if (!cnicField) return;

  cnicField.addEventListener("input", (e) => {
    const cursorFromEnd = e.target.value.length - e.target.selectionStart;
    e.target.value = formatCnic(e.target.value);
    const newPos = e.target.value.length - cursorFromEnd;
    e.target.setSelectionRange(newPos, newPos);
  });
}

/* ---------- Required-field validation (shared helper) ---------- */
function validateRequired(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    const wrapper = field.closest(".field");
    const isEmpty = !field.value || !field.value.trim();

    if (isEmpty) {
      isValid = false;
      wrapper?.classList.add("has-error");
      field.classList.add("invalid");
    } else {
      wrapper?.classList.remove("has-error");
      field.classList.remove("invalid");
    }
  });

  const cnicField = form.querySelector("#cnic");
  if (cnicField && cnicField.value) {
    const digits = cnicField.value.replace(/\D/g, "");
    const wrapper = cnicField.closest(".field");
    if (digits.length !== 13) {
      isValid = false;
      wrapper?.classList.add("has-error");
      cnicField.classList.add("invalid");
    }
  }

  return isValid;
}

/* ---------- Helper: show a temporary loading spinner on a submit button ---------- */
function withButtonLoading(button, durationMs, callback) {
  if (!button) {
    callback();
    return;
  }
  button.classList.add("is-loading");
  setTimeout(() => {
    button.classList.remove("is-loading");
    callback();
  }, durationMs);
}

/* ---------- Profile form ---------- */
function initProfileValidation() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    withButtonLoading(submitBtn, 800, () => {
      if (validateRequired(form)) {
        showToast("Profile saved successfully");
      } else {
        showToast("Please fill in all required fields");
      }
    });
  });

  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("input", () => {
      const wrapper = field.closest(".field");
      if (field.value.trim()) {
        wrapper?.classList.remove("has-error");
        field.classList.remove("invalid");
      }
    });
  });
}

/* ---------- Login form (index.html) ---------- */
function initLoginValidation() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    withButtonLoading(submitBtn, 700, () => {
      if (validateRequired(form)) {
        // NOTE: replace with real auth call once backend is wired up
        window.location.href = "dashboard.html";
      } else {
        showToast("Please enter your Employee ID and Password");
      }
    });
  });
}

/* ---------- Sign-up form (signup.html) ---------- */
function initSignupValidation() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    const fieldsValid = validateRequired(form);
    const password = form.querySelector("#password");
    const confirmPassword = form.querySelector("#confirmPassword");
    let passwordsMatch = true;

    if (password && confirmPassword) {
      const wrapper = confirmPassword.closest(".field");
      passwordsMatch = password.value === confirmPassword.value;

      if (!passwordsMatch) {
        wrapper?.classList.add("has-error");
        confirmPassword.classList.add("invalid");
      } else if (confirmPassword.value.trim()) {
        wrapper?.classList.remove("has-error");
        confirmPassword.classList.remove("invalid");
      }
    }

    withButtonLoading(submitBtn, 900, () => {
      if (fieldsValid && passwordsMatch) {
        // NOTE: replace with real signup API call once backend is wired up
        showToast("Account created — redirecting to sign in…");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      } else if (!passwordsMatch) {
        showToast("Passwords do not match");
      } else {
        showToast("Please fill in all required fields");
      }
    });
  });

  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("input", () => {
      const wrapper = field.closest(".field");
      if (field.value.trim()) {
        wrapper?.classList.remove("has-error");
        field.classList.remove("invalid");
      }
    });
  });
}

/* ---------- Forgot password form (forgot-password.html) ---------- */
function initForgotPasswordValidation() {
  const form = document.getElementById("forgotPasswordForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    withButtonLoading(submitBtn, 900, () => {
      if (validateRequired(form)) {
        // NOTE: replace with real "send reset email" API call once backend is wired up
        showToast("If that Employee ID exists, a reset link has been sent");
        form.reset();
      } else {
        showToast("Please enter your Employee ID");
      }
    });
  });
}

/* ---------- Notifications dropdown ---------- */
function initNotifDropdown() {
  const btn = document.getElementById("notifBtn");
  const dropdown = document.getElementById("notifDropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  const clearBtn = dropdown.querySelector(".notif-clear");
  clearBtn?.addEventListener("click", () => {
    dropdown.querySelectorAll(".notif-item").forEach((item) => item.classList.remove("unread"));
    dropdown.querySelectorAll(".notif-dot").forEach((dot) => dot.classList.add("read"));
    const badgeDot = btn.querySelector(".badge-dot");
    if (badgeDot) badgeDot.style.display = "none";
  });
}

/* ---------- Avatar upload preview (profile.html) ---------- */
function initAvatarUpload() {
  const input = document.getElementById("avatarInput");
  const preview = document.getElementById("avatarPreview");
  if (!input || !preview) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      preview.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // NOTE: actual upload to server happens once backend endpoint is available
  });
}

/* ---------- Toast notification ---------- */
let toastTimeout;
function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}