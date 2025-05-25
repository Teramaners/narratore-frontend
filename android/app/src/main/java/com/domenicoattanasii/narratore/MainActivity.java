package com.domenicoattanasii.narratore;

import com.getcapacitor.BridgeActivity; // Importa la classe BridgeActivity di Capacitor
import android.os.Bundle; // Lascia questo import

// MODIFICA QUI: Estendi BridgeActivity invece di AppCompatActivity
public class MainActivity extends BridgeActivity {
    // Rimuovi completamente il metodo onCreate se non hai bisogno di logica Android nativa aggiuntiva.
    // Capacitor gestirà automaticamente la creazione e il caricamento della WebView.

    // Se hai bisogno di fare qualcosa all'avvio, puoi sovrascrivere onCreate,
    // ma DEVI CHIAMARE super.onCreate(savedInstanceState); e NON ricreare una WebView manualmente.
    /* Esempio se ti servisse onCreate:
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); // <--- Chiamata OBBLIGATORIA
        // Fai qui la tua logica nativa aggiuntiva, se ne hai bisogno
    }
    */
}
