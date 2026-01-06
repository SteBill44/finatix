import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CertificateCard from "@/components/certificates/CertificateCard";
import { useCertificates } from "@/hooks/useCertificates";
import { Skeleton } from "@/components/ui/skeleton";

const Certificates = () => {
  const { data: certificates, isLoading } = useCertificates();

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-muted-foreground">
            View and share your course completion certificates
          </p>
        </div>

        {/* Certificates Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : certificates?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">No certificates yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete a course to earn your first certificate. Certificates can be 
                shared on LinkedIn and downloaded as PDFs.
              </p>
              <Button asChild>
                <Link to="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates?.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CertificateCard certificate={cert} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
