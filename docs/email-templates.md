# Supabase email templates

Supabase only allows editing email templates once a custom SMTP sender is set up
(Authentication → Emails → "Set up SMTP"). Planned sender: Resend with the shop's own domain
(see docs/TODO.md). Until then Supabase's default templates are used, and their links only
finish the login in the browser where the customer signed up; the email is confirmed either way
and `/auth/confirm` sends people to log in.

After SMTP is set up, paste these in Authentication → Emails. Keep `{{ .RedirectTo }}` and
`{{ .TokenHash }}` exactly as written: the links then go straight to `/auth/confirm` and work in
any browser or device.

## Confirm signup

Subject: `Confirm your account – The Veminence`

```html
<h2>Confirm your email / Potwierdź swój adres e-mail</h2>
<p>Thank you for creating an account at The Veminence. Click the link below to confirm it.</p>
<p>Dziękujemy za założenie konta w The Veminence. Kliknij poniższy link, aby je potwierdzić.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirm email / Potwierdź adres e-mail</a></p>
```

## Reset password

Subject: `Reset your password – The Veminence`

```html
<h2>Set a new password / Ustaw nowe hasło</h2>
<p>Click the link below to set a new password. If you didn't ask for this, you can ignore this email.</p>
<p>Kliknij poniższy link, aby ustawić nowe hasło. Jeśli to nie Ty prosiłeś(-aś) o zmianę, zignoruj tę wiadomość.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Set new password / Ustaw nowe hasło</a></p>
```
