import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';
import User from '@/models/User';
import { uploadImage } from '@/lib/cloudinary';
import Location from '@/models/Location';
import { openaiFormatLocation } from '@/utils/location';

// GET /api/tutors/[id] - Get a specific tutor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tutor });
  } catch (error: any) {
    console.error('Error fetching tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tutors/[id] - Update a tutor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Find the existing tutor
    const existingTutor = await Tutor.findById(id);
    if (!existingTutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let updateData: any = {};

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with potential file uploads)
      const formData = await request.formData();
      
      // Extract text fields
      updateData = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        gender: formData.get('gender') as string,
        address: formData.get('address') as string,
        fatherName: formData.get('fatherName') as string,
        fatherNumber: formData.get('fatherNumber') as string,
        version: formData.get('version') as string,
        group: formData.get('group') as string,
        schoolName: formData.get('schoolName') as string,
        collegeName: formData.get('collegeName') as string,
        university: formData.get('university') as string,
        universityShortForm: formData.get('universityShortForm') as string,
        department: formData.get('department') as string,
        yearAndSemester: formData.get('yearAndSemester') as string,
        experience: formData.get('experience') as string,
      };

      // Handle array fields
      const preferredSubjects = formData.get('preferredSubjects') as string;
      if (preferredSubjects) {
        updateData.preferredSubjects = preferredSubjects.split(',').map(s => s.trim()).filter(Boolean);
      }

      const preferredLocation = formData.get('preferredLocation') as string;
      if (preferredLocation) {
        updateData.preferredLocation = preferredLocation.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Handle academic qualifications
      const sscResult = formData.get('sscResult') as string;
      const hscResult = formData.get('hscResult') as string;
      const oLevelResult = formData.get('oLevelResult') as string;
      const aLevelResult = formData.get('aLevelResult') as string;

      if (sscResult || hscResult || oLevelResult || aLevelResult) {
        updateData.academicQualifications = {
          ...(existingTutor.academicQualifications || {}),
          ...(sscResult && { sscResult }),
          ...(hscResult && { hscResult }),
          ...(oLevelResult && { oLevelResult }),
          ...(aLevelResult && { aLevelResult }),
        };
      }

      // Handle location
      const division = formData.get('division') as string;
      const district = formData.get('district') as string;
      const area = formData.get('area') as string;

      if (division || district || area) {
        const formattedLocation = await openaiFormatLocation(division, district, area);
        let locationDoc = await Location.findOne(formattedLocation);
        
        if (!locationDoc) {
          locationDoc = new Location(formattedLocation);
          await locationDoc.save();
        }
        updateData.location = locationDoc._id;
      }

      // Handle file uploads
      const nidPhoto = formData.get('nidPhoto') as File | null;
      const studentIdPhoto = formData.get('studentIdPhoto') as File | null;

      if (nidPhoto && nidPhoto.size > 0) {
        try {
          const uploadRes = await uploadImage(nidPhoto, { folder: 'smart-tutors/nid' });
          updateData.documents = {
            ...(existingTutor.documents || {}),
            nidPhoto: uploadRes.secure_url
          };
        } catch (error) {
          console.error('NID photo upload failed:', error);
        }
      }

      if (studentIdPhoto && studentIdPhoto.size > 0) {
        try {
          const uploadRes = await uploadImage(studentIdPhoto, { folder: 'smart-tutors/student-id' });
          updateData.documents = {
            ...(updateData.documents || existingTutor.documents || {}),
            studentIdPhoto: uploadRes.secure_url
          };
        } catch (error) {
          console.error('Student ID photo upload failed:', error);
        }
      }

      // Remove any undefined or empty string values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

    } else {
      // Handle JSON body (backward compatibility)
      updateData = await request.json();
    }

    // Update the tutor
    const updatedTutor = await Tutor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Tutor updated successfully',
      tutor: updatedTutor 
    });
  } catch (error: any) {
    console.error('Error updating tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/tutors/[id] - Delete a tutor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Find the tutor first
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Delete associated user account
    await User.findOneAndDelete({ tutorId: id });

    // Delete the tutor
    await Tutor.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Tutor and associated user account deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 