import { a as getAuthState, e as signInWithGoogle } from "./auth-DRu1Lwtc.js";
import "./preload-helper-CyNIpbXk.js";
import "./env-BLrtva26.js";
const btnFigma = document.getElementById("btn-figma");
const btnInspect = document.getElementById("btn-inspect");
const btnAssets = document.getElementById("btn-assets");
const btnPanel = document.getElementById("btn-panel");
const btnGoogleSignin = document.getElementById("btn-google-signin");
const googleSigninSection = document.getElementById("google-signin-section");
const planBadge = document.getElementById("plan-badge");
getAuthState().then(({ isLoggedIn, plan }) => {
  if (!isLoggedIn) {
    googleSigninSection.style.display = "block";
  }
  if (plan && plan !== "free") {
    planBadge.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
    planBadge.classList.add(plan);
  }
}).catch(() => {
  googleSigninSection.style.display = "block";
});
btnGoogleSignin.addEventListener("click", async () => {
  btnGoogleSignin.disabled = true;
  btnGoogleSignin.querySelector("span").textContent = "Signing in...";
  const result = await signInWithGoogle();
  if (result.error) {
    btnGoogleSignin.disabled = false;
    btnGoogleSignin.querySelector("span").textContent = "Sign in with Google";
  } else {
    googleSigninSection.style.display = "none";
    const state = await getAuthState();
    if (state.plan && state.plan !== "free") {
      planBadge.textContent = state.plan.charAt(0).toUpperCase() + state.plan.slice(1);
    }
  }
});
btnFigma.addEventListener("click", () => {
  chrome.storage.local.set({ openTab: "figma" });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
  });
  setTimeout(() => window.close(), 200);
});
btnInspect.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_INSPECT" }, (response) => {
    if (response?.active) {
      btnInspect.classList.add("active");
      btnInspect.querySelector("span").textContent = "Stop Inspecting";
      setTimeout(() => window.close(), 300);
    } else {
      btnInspect.classList.remove("active");
      btnInspect.querySelector("span").textContent = "Start Inspecting";
    }
  });
});
btnAssets.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
  });
  chrome.runtime.sendMessage({ type: "EXTRACT_ASSETS" }, (response) => {
    if (response?.success) {
      chrome.storage.local.set({ lastExtractedAssets: response.assets });
    }
  });
  setTimeout(() => window.close(), 300);
});
btnPanel.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
  });
  setTimeout(() => window.close(), 200);
});
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "PING" }, (response) => {
      if (chrome.runtime.lastError) return;
    });
  }
});
