import { PatientDetailView } from "@/components/patients/detail/PatientDetailView";

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return <PatientDetailView patientId={decodeURIComponent(params.id)} />;
}
