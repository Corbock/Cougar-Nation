/* Shared 3D character model used by the locker preview (index.html) and the bathroom mirrors (game.html). */
(function () {
  const SKINS = { Light: '#f1c7a5', Tan: '#d9a273', Brown: '#9b6a45', Deep: '#5e3b27' };
  const HAIR_STYLES = ['Short', 'Long', 'Buzz', 'Bun', 'Curly', 'Bald'];
  const HAIR_COLORS = { Black: '#1d1815', Brown: '#4a2f20', Blonde: '#d2ad5b', Red: '#a8452a', Gray: '#9a9a96', Blue: '#3567b0' };
  const PANTS = { Navy: '#232c45', Khaki: '#a69470', Black: '#1b1b1b', Denim: '#4a6a94' };
  const BUILDS = { Slim: [0.9, 1], Average: [1, 1], Broad: [1.13, 1], Tall: [1, 1.09] };
  const OUTFITS = ['Varsity jacket', 'Campus security', 'Track team', 'Night study'];
  const CHARACTERS = {
    'The New Kid': {},
    'Hall Monitor': { outfit: 'Campus security', jacketColor: '#303b43', hairStyle: 'Buzz', hairColor: 'Black', pants: 'Black', build: 'Broad' },
    'Transfer Student': { outfit: 'Night study', jacketColor: '#384556', hairStyle: 'Long', hairColor: 'Blonde', skin: 'Light', pants: 'Denim', build: 'Slim' },
  };
  const JACKET_COLORS = ['#c8ed4c', '#e77948', '#789b9c', '#d8d1bd', '#303b43', '#b84637', '#384556'];
  const DEFAULT_LOOK = {
    character: 'The New Kid', outfit: 'Varsity jacket', jacketColor: '#c8ed4c',
    skin: 'Tan', hairStyle: 'Short', hairColor: 'Brown', pants: 'Navy', build: 'Average',
  };

  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
  function normalizeLook(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    return {
      character: pick(r.character, Object.keys(CHARACTERS), DEFAULT_LOOK.character),
      outfit: pick(r.outfit, OUTFITS, DEFAULT_LOOK.outfit),
      jacketColor: pick(r.jacketColor, JACKET_COLORS, DEFAULT_LOOK.jacketColor),
      skin: pick(r.skin, Object.keys(SKINS), DEFAULT_LOOK.skin),
      hairStyle: pick(r.hairStyle, HAIR_STYLES, DEFAULT_LOOK.hairStyle),
      hairColor: pick(r.hairColor, Object.keys(HAIR_COLORS), DEFAULT_LOOK.hairColor),
      pants: pick(r.pants, Object.keys(PANTS), DEFAULT_LOOK.pants),
      build: pick(r.build, Object.keys(BUILDS), DEFAULT_LOOK.build),
    };
  }

  // Returns a Group facing +Z with its feet on y = 0 (about 1.75 m tall).
  function build(THREE, rawLook) {
    const look = normalizeLook(rawLook);
    const mat = (color, shininess = 10) => new THREE.MeshPhongMaterial({ color, shininess });
    const box = (w, h, d, x, y, z, m, parent) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    };
    const skin = mat(SKINS[look.skin]), hairMat = mat(HAIR_COLORS[look.hairColor], 4);
    const top = mat(look.jacketColor), pants = mat(PANTS[look.pants]);
    const white = mat('#f1f0e8'), shoe = mat('#202020');

    const root = new THREE.Group();
    const [width, height] = BUILDS[look.build];
    const body = new THREE.Group();
    body.scale.set(width, height, width);
    root.add(body);

    const legs = [], arms = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(side * 0.1, 0.82, 0);
      box(0.17, 0.74, 0.18, 0, -0.41, 0, pants, leg);
      box(0.19, 0.08, 0.28, 0, -0.78, 0.04, shoe, leg);
      body.add(leg); legs.push(leg);

      const arm = new THREE.Group(); arm.position.set(side * 0.3, 1.34, 0);
      box(0.13, 0.5, 0.13, 0, -0.25, 0, top, arm);
      box(0.1, 0.1, 0.1, 0, -0.55, 0, skin, arm);
      if (look.outfit === 'Track team') box(0.14, 0.06, 0.14, 0, -0.18, 0, white, arm);
      if (look.outfit === 'Varsity jacket') box(0.14, 0.07, 0.14, 0, -0.46, 0, white, arm);
      body.add(arm); arms.push(arm);
    }

    const torso = new THREE.Group(); body.add(torso);
    box(0.44, 0.58, 0.24, 0, 1.09, 0, top, torso);
    box(0.09, 0.07, 0.09, 0, 1.4, 0, skin, torso);
    if (look.outfit === 'Varsity jacket') {
      box(0.3, 0.06, 0.26, 0, 1.38, 0, white, torso);
      box(0.1, 0.14, 0.02, -0.1, 1.2, 0.125, white, torso);
    } else if (look.outfit === 'Campus security') {
      box(0.11, 0.09, 0.02, 0.1, 1.22, 0.125, mat('#d6c58a', 40), torso);
      box(0.46, 0.06, 0.26, 0, 0.84, 0, mat('#15191c'), torso);
    } else if (look.outfit === 'Track team') {
      box(0.04, 0.58, 0.25, -0.14, 1.09, 0, white, torso);
      box(0.04, 0.58, 0.25, 0.14, 1.09, 0, white, torso);
    } else {
      box(0.34, 0.16, 0.12, 0, 1.38, -0.12, top, torso); // hood
      box(0.3, 0.1, 0.02, 0, 0.9, 0.125, mat('#1d2430'), torso);
    }

    const head = new THREE.Group(); head.position.set(0, 1.56, 0); body.add(head);
    box(0.25, 0.28, 0.25, 0, 0, 0, skin, head);
    for (const side of [-1, 1]) {
      box(0.04, 0.045, 0.02, side * 0.06, 0.02, 0.128, mat('#141210'), head);
      box(0.06, 0.015, 0.02, side * 0.06, 0.07, 0.128, hairMat, head);
    }
    box(0.07, 0.014, 0.02, 0, -0.07, 0.128, mat('#8a4f45'), head);

    switch (look.hairStyle) {
      case 'Short':
        box(0.27, 0.09, 0.27, 0, 0.15, 0, hairMat, head);
        box(0.27, 0.2, 0.06, 0, 0.06, -0.12, hairMat, head);
        box(0.27, 0.05, 0.05, 0, 0.12, 0.13, hairMat, head);
        break;
      case 'Long':
        box(0.27, 0.09, 0.27, 0, 0.15, 0, hairMat, head);
        box(0.27, 0.42, 0.06, 0, -0.07, -0.12, hairMat, head);
        box(0.05, 0.3, 0.22, -0.13, -0.03, 0, hairMat, head);
        box(0.05, 0.3, 0.22, 0.13, -0.03, 0, hairMat, head);
        break;
      case 'Buzz':
        box(0.26, 0.04, 0.26, 0, 0.15, 0, hairMat, head);
        break;
      case 'Bun':
        box(0.27, 0.08, 0.27, 0, 0.15, 0, hairMat, head);
        box(0.27, 0.16, 0.05, 0, 0.07, -0.12, hairMat, head);
        head.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), hairMat), { position: new THREE.Vector3(0, 0.23, -0.05) }));
        break;
      case 'Curly':
        for (const [x, y, z] of [[-0.09, 0.16, 0.05], [0.09, 0.16, 0.05], [0, 0.19, -0.03], [-0.1, 0.1, -0.1], [0.1, 0.1, -0.1], [0, 0.12, -0.13], [-0.14, 0.06, 0], [0.14, 0.06, 0]]) {
          const curl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), hairMat);
          curl.position.set(x, y, z); head.add(curl);
        }
        break;
      default:
        break;
    }
    if (look.outfit === 'Campus security') {
      box(0.29, 0.07, 0.29, 0, 0.17, 0, mat('#15191c'), head);
      box(0.25, 0.02, 0.12, 0, 0.14, 0.2, mat('#15191c'), head);
    } else if (look.outfit === 'Track team') {
      box(0.28, 0.04, 0.28, 0, 0.09, 0, white, head);
    }

    root.userData = { body, torso, head, legs, arms };
    return root;
  }

  // speed in m/s, crouch 0..1; call every frame
  function animate(avatar, time, speed, crouch) {
    const { body, torso, head, legs, arms } = avatar.userData;
    const swing = Math.sin(time * 8) * Math.min(0.8, speed * 0.25);
    legs[0].rotation.x = swing; legs[1].rotation.x = -swing;
    arms[0].rotation.x = -swing * 0.8; arms[1].rotation.x = swing * 0.8;
    const breathe = Math.sin(time * 1.8) * 0.01;
    arms[0].rotation.z = 0.04 + breathe * 3; arms[1].rotation.z = -0.04 - breathe * 3;
    torso.scale.y = 1 + breathe;
    body.position.y = -crouch * 0.25 + Math.abs(Math.sin(time * 8)) * Math.min(0.03, speed * 0.01);
    body.rotation.x = crouch * 0.22;
    head.rotation.x = -crouch * 0.18;
  }

  window.CougarAvatar = {
    SKINS, HAIR_STYLES, HAIR_COLORS, PANTS, BUILDS, OUTFITS, CHARACTERS, JACKET_COLORS, DEFAULT_LOOK,
    normalizeLook, build, animate,
  };
})();
