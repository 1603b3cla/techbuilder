document.addEventListener("DOMContentLoaded", () => {
    const updateBtn = document.getElementById("updateBtn");
    const form = document.getElementById("profileForm");

    // Cuando se haga clic en el botón de actualizar
    updateBtn.addEventListener("click", (event) => {
        // Aquí puedes agregar validación adicional si lo necesitas
        // Si todo es correcto, el formulario se enviará
        form.submit();
    });
});
