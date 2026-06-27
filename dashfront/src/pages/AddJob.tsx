import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { addJob, updateJob } from "../api/jobApi";
import type { JobPosting } from "../types/Job";
import api from "../api/axiosconfig";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

const noSpecialChars = /^[a-zA-Z0-9\s\-_.,]+$/;
const generalCharMsg = "Only letters, numbers, spaces, and - _ . , are allowed";

const jobSchema = z.object({
    title: z.string()
        .min(2, "Title must be at least 2 characters")
        .regex(noSpecialChars, generalCharMsg),

    company: z.string()
        .min(2, "Company name is required")
        .regex(noSpecialChars, generalCharMsg),

    location: z.string()
        .min(2, "Location is required")
        .regex(noSpecialChars, generalCharMsg),

    postedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),

    salary: z.coerce.number().min(0, "Salary must be positive").optional(),

    currency: z.string()
        .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code (e.g. USD)")
        .optional(),

    experienceLevel: z.enum(["Entry", "Mid", "Senior", "Lead"]),

    naceCode: z.string().min(1, "NACE Sector is required"),

    remoteFlexibility: z.enum(["Remote", "Onsite", "Hybrid"]),

    employmentType: z.enum(["Full-time", "Part-time", "Contract", "Freelance"]),

    requiredLanguagesString: z.string()
        .regex(/^[a-zA-Z0-9\s\-_.,#+]+$/, "Only letters, numbers, spaces, and - _ . , # + are allowed")
        .optional()
});

type JobFormValues = z.infer<typeof jobSchema>;

export const NACE_SECTORS = [
    { code: "J", description: "Information and communication" },
    { code: "Q", description: "Human health and social work activities" },
    { code: "K", description: "Financial and insurance activities" },
    { code: "C", description: "Manufacturing" },
    { code: "G", description: "Wholesale and retail trade" },
    { code: "D", description: "Electricity, gas, steam and air conditioning supply" },
    { code: "E", description: "Water supply; sewerage, waste management and remediation activities" },
    { code: "F", description: "Construction" },
    { code: "H", description: "Transportation and storage" },
    { code: "L", description: "Real estate activities" },
    { code: "M", description: "Professional, scientific and technical activities" },
    { code: "N", description: "Administrative and support service activities" },
    { code: "it-jobs", description: "IT Jobs" },
    { code: "engineering-jobs", description: "Engineering Jobs" },
    { code: "accounting-finance-jobs", description: "Accounting & Finance Jobs" },
    { code: "healthcare-nursing-jobs", description: "Healthcare & Nursing Jobs" },
    { code: "sales-jobs", description: "Sales Jobs" },
    { code: "teaching-jobs", description: "Teaching Jobs" }
];

export const COMMON_CURRENCIES = [
    "USD", // US Dollar
    "EUR", // Euro
    "GBP", // British Pound
    "JPY", // Japanese Yen
    "CHF", // Swiss Franc
    "CAD", // Canadian Dollar
    "AUD", // Australian Dollar
    "RON", // Romanian Leu
    "CNY", // Chinese Yuan
];

export default function AddJob() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Determine if we are editing an existing job
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const isEditing = Boolean(id);

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema) as any,
        defaultValues: {
            title: "",
            company: "",
            location: "",
            postedDate: new Date().toISOString().split('T')[0],
            salary: 0,
            currency: "USD",
            naceCode: "J", // Default to IT
            experienceLevel: "Mid",
            remoteFlexibility: "Hybrid",
            employmentType: "Full-time",
            requiredLanguagesString: ""
        }
    });

    // Load existing job data if we are editing
    useEffect(() => {
        if (isEditing) {
            setIsLoadingData(true);
            api.get(`/jobs/${id}`)
                .then(response => {
                    const job = response.data;

                    form.reset({
                        title: job.title || "",
                        company: job.company || "",
                        location: job.location || "",
                        postedDate: job.postedDate ? new Date(job.postedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        salary: job.salary || 0,
                        currency: job.currency || "USD",
                        naceCode: job.naceCode || "J",
                        experienceLevel: job.experienceLevel || "Mid",
                        remoteFlexibility: job.remoteFlexibility || "Hybrid",
                        employmentType: job.employmentType || "Full-time",
                        requiredLanguagesString: job.requiredLanguages ? job.requiredLanguages.join(', ') : ""
                    });
                })
                .catch(err => {
                    console.error("Failed to load job data for editing", err);
                    setSubmitError("Failed to load existing job data.");
                })
                .finally(() => {
                    setIsLoadingData(false);
                });
        }
    }, [id, isEditing, form]);

    const onSubmit: SubmitHandler<JobFormValues> = async (data) => {
        setSubmitError(null);
        try {
            const languagesArray = data.requiredLanguagesString
                ? data.requiredLanguagesString.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

            const selectedNace = NACE_SECTORS.find(n => n.code === data.naceCode);

            const formattedData: JobPosting = {
                title: data.title,
                company: data.company,
                location: data.location,
                postedDate: new Date(data.postedDate).toISOString(),
                salary: data.salary,
                currency: data.currency || "USD",
                experienceLevel: data.experienceLevel,
                naceCode: data.naceCode,
                industry: selectedNace ? selectedNace.description : "Unknown", // Backward compat
                remoteFlexibility: data.remoteFlexibility,
                employmentType: data.employmentType,
                requiredLanguages: languagesArray
            };

            if (isEditing && id) {
                await updateJob(Number(id), formattedData);
            } else {
                await addJob(formattedData);
            }

            navigate("/jobs");
        } catch (err) {
            console.error(err);
            setSubmitError(isEditing ? "Failed to update job." : "Failed to add job. Ensure backend is running.");
        }
    };

    if (isLoadingData) {
        return <div className="p-8 text-center">Loading job data...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-8 bg-card text-card-foreground rounded-xl shadow-md border border-border my-10 transition-colors">
            <h2 className="text-3xl font-bold mb-8 text-foreground border-b border-border pb-4">
                {isEditing ? "Edit Job Posting" : "Create Job Posting"}
            </h2>

            {submitError && (
                <div className="bg-destructive/10 text-destructive p-4 rounded mb-6 border border-destructive/20">
                    {submitError}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }: { field: ControllerRenderProps<JobFormValues, "title"> }) => (
                                <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Frontend Dev" {...field} className="bg-background text-foreground border-input" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }: { field: ControllerRenderProps<JobFormValues, "company"> }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. TechNova" {...field} className="bg-background text-foreground border-input" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }: { field: ControllerRenderProps<JobFormValues, "location"> }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. New York, NY" {...field} className="bg-background text-foreground border-input" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postedDate"
                            render={({ field }: { field: ControllerRenderProps<JobFormValues, "postedDate"> }) => (
                                <FormItem>
                                    <FormLabel>Posted Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="bg-background text-foreground border-input" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-background p-6 rounded-lg border border-border mt-8 transition-colors">
                        <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Analytics Data</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }: { field: ControllerRenderProps<JobFormValues, "salary"> }) => (
                                    <FormItem>
                                        <FormLabel>Salary</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="120000"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                className="bg-card text-foreground border-input"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }: { field: ControllerRenderProps<JobFormValues, "currency"> }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-card text-foreground border-input">
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-card-foreground border-border">
                                                {COMMON_CURRENCIES.map(curr => (
                                                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="naceCode"
                                render={({ field }: { field: ControllerRenderProps<JobFormValues, "naceCode"> }) => (
                                    <FormItem>
                                        <FormLabel>Economic Sector (NACE / Adzuna)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-card text-foreground border-input">
                                                    <SelectValue placeholder="Select sector" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-card-foreground border-border max-h-60 overflow-y-auto">
                                                {NACE_SECTORS.map(sector => (
                                                    <SelectItem key={sector.code} value={sector.code} title={sector.description}>
                                                        {sector.description.length > 25 ? sector.description.substring(0, 25) + "..." : sector.description}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="experienceLevel"
                                render={({ field }: { field: ControllerRenderProps<JobFormValues, "experienceLevel"> }) => (
                                    <FormItem>
                                        <FormLabel>Experience Level</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-card text-foreground border-input">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-card-foreground border-border">
                                                <SelectItem value="Entry">Entry</SelectItem>
                                                <SelectItem value="Mid">Mid</SelectItem>
                                                <SelectItem value="Senior">Senior</SelectItem>
                                                <SelectItem value="Lead">Lead</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="remoteFlexibility"
                                render={({ field }: { field: ControllerRenderProps<JobFormValues, "remoteFlexibility"> }) => (
                                    <FormItem>
                                        <FormLabel>Work Setup</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-card text-foreground border-input">
                                                    <SelectValue placeholder="Select setup" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-card-foreground border-border">
                                                <SelectItem value="Remote">Remote</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                <SelectItem value="Onsite">Onsite</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="employmentType"
                                render={({ field }: { field: ControllerRenderProps<JobFormValues, "employmentType"> }) => (
                                    <FormItem>
                                        <FormLabel>Employment Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-card text-foreground border-input">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-card-foreground border-border">
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Part-time">Part-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                                <SelectItem value="Freelance">Freelance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <FormField
                            control={form.control}
                            name="requiredLanguagesString"
                            render={({ field }: { field: ControllerRenderProps<JobFormValues, "requiredLanguagesString"> }) => (
                                <FormItem>
                                    <FormLabel>Required Languages</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Java, Python, SQL" {...field} value={field.value || ""} className="bg-background text-foreground border-input" />
                                    </FormControl>
                                    <FormMessage className="text-xs text-muted-foreground">Comma separated. Only letters, numbers, spaces, and - _ . , # + are allowed</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/jobs")}
                            className="bg-transparent text-foreground border-border hover:bg-secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="bg-primary hover:opacity-90 text-primary-foreground"
                        >
                            {form.formState.isSubmitting ? "Saving..." : (isEditing ? "Update Job Posting" : "Save Job Posting")}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}