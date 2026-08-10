export function ContactForm() {
  return (
    <form className="space-y-4" action="/api/contact" method="post">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Name</label>
        <input className="border rounded-md px-3 py-2" name="name" placeholder="Your name" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email</label>
        <input className="border rounded-md px-3 py-2" type="email" name="email" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Message</label>
        <textarea className="border rounded-md px-3 py-2" name="message" rows={4} placeholder="How can we help?" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="captcha" />
        <span className="text-sm text-muted-foreground">I’m not a robot</span>
      </div>
      <button type="submit" className="inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">
        Send
      </button>
    </form>
  );
}
