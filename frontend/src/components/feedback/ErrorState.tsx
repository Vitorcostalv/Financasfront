const ErrorState = ({ message = 'Nao foi possivel carregar.' }: { message?: string }) => (
  <div className="flex items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 px-6 py-10 text-sm text-orange-200">
    {message}
  </div>
);

export default ErrorState;
