export function clearBrowserExtensionInjectionsBeforeHydration() {
  document
    .querySelectorAll(
      [
        "html > *:not(body, head)",
        'script[src*="extension://"]',
        'link[href*="extension://"]',
      ].join(", ")
    )
    .forEach((s) => {
      s.parentNode?.removeChild(s);
    });

  const $targets = {
    html: {
      $elm: document.querySelector("html")!,
      allowedAttributes: ["lang", "dir", "class"],
    },
    head: {
      $elm: document.querySelector("head")!,
      allowedAttributes: [""],
    },
    body: {
      $elm: document.querySelector("body")!,
      allowedAttributes: ["class"],
    },
  };

  Object.entries($targets).forEach(([, target]) => {
    target.$elm.getAttributeNames().forEach((attr) => {
      if (!target.allowedAttributes.includes(attr)) {
        target.$elm.removeAttribute(attr);
      }
    });
  });
}
