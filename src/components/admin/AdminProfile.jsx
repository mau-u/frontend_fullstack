
import React from 'react';


// ========================================
// COMPONENTE: PERFIL DEL ADMINISTRADOR
// ========================================

export default function AdminProfile({ user }) {
  return (
    <>
      {/* Encabezado de la página */}
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">
            Cuenta
          </p>

          <h1>Perfil de administrador</h1>

          <p>
            Datos de la cuenta demo utilizada para esta presentación.
          </p>
        </div>
      </div>


      {/* Información del administrador */}
      <section className="admin-panel profile-panel">

        {/* Avatar con la inicial del usuario */}
        <div className="profile-avatar">
          {user?.nombre?.slice(0, 1) || 'M'}
        </div>


        {/* Datos de la sesión activa */}
        <div>
          <p className="eyebrow">
            Sesión activa
          </p>

          <h2>
            {user?.nombre || 'Administración Mil Sabores'}
          </h2>

          <p>
            {user?.email || 'admin.ep3@duoc.cl'}
          </p>

          <span className="status-chip paid">
            Administrador
          </span>
        </div>


        {/* Aviso sobre el funcionamiento del proyecto */}
        <div className="profile-note">
          <strong>Modo académico</strong>

          <p>
            La cuenta y los datos de negocio se gestionan desde el backend Spring Boot y MySQL.
            El flujo de pago es una simulación académica: no se conecta a una pasarela externa.
          </p>
        </div>

      </section>
    </>
  );
}
