import { titleCase } from "@/lib/text";

/** Tautan undangan personal: nama tamu terkunci di formulir ucapan dan RSVP. */
export function inviteLink(origin: string, name: string) {
  return `${origin}/?${new URLSearchParams({ to: name }).toString()}`;
}

/** Teks WhatsApp untuk satu grup (tautan umum tanpa nama). */
export function groupMessage(origin: string, groupName = "anggota grup") {
  return `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\nKepada Yth.\nBapak/Ibu/Saudara/i ${titleCase(groupName)}\n\nTanpa mengurangi rasa hormat, dengan memohon ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i sekalian untuk menghadiri acara pernikahan kami:\n\nFeriman & Ayu Natasya\n\nWaktu, tempat, dan informasi lengkap acara dapat dilihat melalui undangan digital berikut:\n${origin}/\n\nMerupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i sekalian berkenan hadir dan memberikan doa restu.\n\nMohon maaf apabila ada kekeliruan dalam penulisan. Terima kasih atas perhatian dan kehadirannya.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh\n\nHormat kami,\nFeriman & Ayu Natasya`;
}

/** Teks WhatsApp untuk satu tamu, berisi tautan personalnya. */
export function personalMessage(origin: string, name: string) {
  return `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\nKepada Yth.\nBapak/Ibu/Saudara/i\n${titleCase(name)}\n\nTanpa mengurangi rasa hormat, dengan memohon ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\nFeriman & Ayu Natasya\n\nWaktu, tempat, dan informasi lengkap acara dapat dilihat melalui undangan digital berikut:\n${inviteLink(origin, name)}\n\nMerupakan kebahagiaan bagi kami apabila berkenan hadir dan memberikan doa restu. Kehadiran Anda akan melengkapi hari bahagia kami.\n\nMohon maaf apabila ada kekeliruan dalam penulisan nama atau gelar. Terima kasih atas perhatian dan kehadirannya.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh\n\nHormat kami,\nFeriman & Ayu Natasya`;
}
