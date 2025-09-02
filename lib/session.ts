export function setEmailIfValid(email: string) {
  const ok = email.toLowerCase().includes("@uni.canberra.edu.au");
  if (!ok) throw new Error("Please use your UC email");
  if (typeof window !== "undefined") {
    localStorage.setItem("sawaali_email", email);
  }
}

export function getSavedEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sawaali_email");
}
