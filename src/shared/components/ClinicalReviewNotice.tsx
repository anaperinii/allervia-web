export function ClinicalReviewNotice({ required, onReview }: { required: boolean; onReview: () => void }) {
  return required ? <div role="alert"><p>O registro mudou. Seu rascunho foi preservado. Confira os dados atuais antes de confirmar.</p><button type="button" onClick={onReview}>Revisei os dados atuais</button></div> : null
}
