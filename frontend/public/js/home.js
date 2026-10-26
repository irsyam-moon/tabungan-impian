if (!localStorage.getItem('token')) location.href = 'login.html';

const $ = (id) => document.getElementById(id);
const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const esc = (t) => {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
};

let goals = [];
let editing = null;

$('user-name').textContent = localStorage.getItem('name') || '';
$('logout').onclick = () => {
  localStorage.clear();
  location.href = 'index.html';
};

async function load() {
  goals = await api('/goals');
  $('total').textContent = rp(goals.reduce((sum, g) => sum + g.saved_amount, 0));
  $('list').innerHTML = goals.length
    ? `<div class='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>${goals.map(card).join('')}</div>`
    : `<div class='border-2 border-dashed border-black p-16 text-center text-neutral-500'>
         <h3 class='text-xl text-black'>Belum ada target</h3>
         <p>Tambahkan barang yang ingin kamu beli untuk mulai menabung.</p>
       </div>`;
}

function card(g) {
  const done = g.saved_amount >= g.target_price;
  const pct = Math.min(100, Math.round((g.saved_amount / g.target_price) * 100));
  return `
    <div class='flex flex-col border-2 border-black bg-white'>
      <img src='${g.image_url}' alt='' class='h-44 w-full border-b-2 border-black object-cover'>
      <div class='flex flex-1 flex-col gap-2 p-3.5'>
        <b class='text-lg'>${esc(g.name)}</b>
        ${done
          ? `<span class='-rotate-2 self-start bg-money px-2.5 py-1 font-mono text-sm font-bold uppercase text-white'>Sudah tercapai</span>`
          : `<span class='font-mono text-xl font-bold'>${rp(g.target_price - g.saved_amount)}</span>`}
        <div class='h-2.5 border-[1.5px] border-black'><div class='h-full bg-money' style='width:${pct}%'></div></div>
        <small class='font-mono text-neutral-500'>${rp(g.saved_amount)} / ${rp(g.target_price)} (${pct}%)</small>
        ${done ? '' : `
          <div class='flex gap-2'>
            <input id='amt-${g.id}' type='number' min='1' placeholder='Nominal' class='field'>
            <button class='btn' data-act='save' data-id='${g.id}'>Tabung</button>
          </div>`}
        <div class='mt-auto flex gap-2'>
          ${done ? `<button class='btn flex-1' data-act='take' data-id='${g.id}'>Ambil uang</button>` : ''}
          <button class='btn-ghost flex-1' data-act='edit' data-id='${g.id}'>Ubah</button>
        </div>
      </div>
    </div>`;
}

// satu listener untuk semua tombol di kartu
$('list').addEventListener('click', async (e) => {
  const button = e.target.closest('button[data-act]');
  if (!button) return;
  const id = Number(button.dataset.id);
  const act = button.dataset.act;

  try {
    if (act === 'edit') return openModal(goals.find((g) => g.id === id));
    if (act === 'save') {
      await api(`/goals/${id}/savings`, { method: 'POST', body: { amount: Number($('amt-' + id).value) } });
    }
    if (act === 'take') {
      if (!confirm('Ambil uang dan hapus target ini?')) return;
      await api(`/goals/${id}`, { method: 'DELETE' });
    }
    await load();
  } catch (err) {
    alert(err.message);
  }
});

function toggleModal(show) {
  $('modal').classList.toggle('hidden', !show);
  $('modal').classList.toggle('grid', show);
}

function openModal(goal = null) {
  editing = goal;
  const f = $('goal-form');
  f.reset();
  $('modal-title').textContent = goal ? 'Ubah Target' : 'Tambah Target';
  f.elements['name'].value = goal ? goal.name : '';
  f.elements['target_price'].value = goal ? goal.target_price : '';
  f.elements['image'].required = !goal; // saat ubah, gambar boleh tidak diganti
  toggleModal(true);
}

$('btn-add').onclick = () => openModal();
$('btn-cancel').onclick = () => toggleModal(false);

$('goal-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  if (editing && !fd.get('image').size) fd.delete('image');
  try {
    await api(editing ? `/goals/${editing.id}` : '/goals', {
      method: editing ? 'PUT' : 'POST',
      form: fd,
    });
    toggleModal(false);
    await load();
  } catch (err) {
    alert(err.message);
  }
});

load();