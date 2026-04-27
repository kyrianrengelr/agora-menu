function onEdit(e) {
  // --- CONFIGURATION ---
  // Onglets pour le blocage complexe (règles de compatibilité)
  var ongletsRegles = ["Régionales"];

  // Onglets pour la vérification "Actif"
  var ongletsActif = ["Menus", "Grecques", "Régionales", "Desserts", "Vins"];

  // Colonnes pour les règles de compatibilité (Régionales)
  var colType = 4;
  var colVeg = 5;
  var colVide = 6;
  var colPoisson = 7;
  var colEnfant = 8;

  // Colonnes pour la vérification "Actif"
  var colNom = 1;    // Colonne A
  var colActif = 3;  // Colonne C
  // ---------------------

  var sheet = e.source.getActiveSheet();
  var sheetName = sheet.getName();
  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();

  // Ignorer la première ligne (en-têtes)
  if (row <= 1) return;

  // ============================================
  // PARTIE 1 : RÈGLES DE COMPATIBILITÉ (Régionales)
  // ============================================
  if (ongletsRegles.indexOf(sheetName) !== -1) {
    // Si on est dans la zone des cases à cocher (colonnes E à H)
    if (col >= 5 && col <= 8) {
      // Si on DÉCOCHE, on ne fait rien pour les règles de compatibilité
      if (range.getValue() !== false) {
        // On lit la ligne
        var ligneValeurs = sheet.getRange(row, 4, 1, 5).getValues()[0];

        var typeValue = ligneValeurs[0];
        var isVeg = ligneValeurs[1];
        var isVide = ligneValeurs[2];
        var isPoisson = ligneValeurs[3];
        var isEnfant = ligneValeurs[4];

        // === CAS 1 : ENTRÉES ===
        if (typeValue === "Entrée" || typeValue === "Entrée et plat" || typeValue === "Entrée/Plat") {
          if (col !== colVeg) {
            range.setValue(false);
            e.source.toast("⛔️ Pour ce type, seul 'Végétarien' est autorisé.");
          }
        }

        // === CAS 2 : PLAT ===
        else if (typeValue === "Plat") {
          if (col === colVeg) {
            if (isVide || isPoisson) {
              range.setValue(false);
              e.source.toast("⛔️ Incompatible avec Vide ou Poisson.");
            }
          }
          if (col === colVide) {
            if (isVeg || isPoisson || isEnfant) {
              range.setValue(false);
              e.source.toast("⛔️ 'Vide' doit être seul.");
            }
          }
          if (col === colPoisson) {
            if (isVeg || isVide || isEnfant) {
              range.setValue(false);
              e.source.toast("⛔️ 'Poisson' doit être seul.");
            }
          }
          if (col === colEnfant) {
            if (isVide || isPoisson) {
              range.setValue(false);
              e.source.toast("⛔️ Incompatible avec Vide ou Poisson.");
            }
          }
        }
      }
    }
  }

  // ============================================
  // PARTIE 2 : VÉRIFICATION "ACTIF"
  // ============================================
  if (ongletsActif.indexOf(sheetName) !== -1) {

    // CAS A : Le client modifie la colonne NOM (A)
    if (col === colNom) {
      var nomValue = range.getValue();

      // Si un nom est saisi (non vide)
      if (nomValue && nomValue.toString().trim() !== "") {
        var actifValue = sheet.getRange(row, colActif).getValue();

        // Si la case Actif n'est pas cochée
        if (actifValue !== true) {
          // Attendre 5 secondes puis vérifier à nouveau
          Utilities.sleep(5000);

          // Re-vérifier l'état actuel (le client a peut-être coché entre-temps)
          var actifValueApres = sheet.getRange(row, colActif).getValue();
          var nomValueApres = sheet.getRange(row, colNom).getValue();

          // Si toujours pas coché ET le nom est toujours présent
          if (actifValueApres !== true && nomValueApres && nomValueApres.toString().trim() !== "") {
            afficherAlerteNouvelElement(nomValueApres);
          }
        }
      }
    }

    // CAS B : Le client DÉCOCHE la case Actif (C)
    if (col === colActif) {
      var actifValue = range.getValue();

      // Si la case vient d'être décochée (false)
      if (actifValue === false) {
        var nomValue = sheet.getRange(row, colNom).getValue();

        // Si la ligne a un nom
        if (nomValue && nomValue.toString().trim() !== "") {
          afficherAlerteDecochage(nomValue);
        }
      }
    }
  }
}

/**
 * Alerte quand l'utilisateur DÉCOCHE la case Actif d'un élément existant
 */
function afficherAlerteDecochage(nomElement) {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    "⚠️ Élément désactivé",
    "Vous avez décoché la case Actif de :\n\n\"" + nomElement + "\" (en rouge)\n\nIl ne s'affichera plus sur la carte. Est-ce bien voulu ?",
    ui.ButtonSet.OK
  );
}

/**
 * Alerte quand l'utilisateur AJOUTE un élément sans cocher Actif
 */
function afficherAlerteNouvelElement(nomElement) {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    "⚠️ Élément non actif",
    "Vous n'avez pas coché la case Actif de :\n\n\"" + nomElement + "\" (en rouge)\n\nIl ne s'affichera pas sur la carte. Est-ce bien voulu ?",
    ui.ButtonSet.OK
  );
}
